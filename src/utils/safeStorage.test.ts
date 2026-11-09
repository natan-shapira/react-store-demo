import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StorageValue } from "zustand/middleware";
import { createSafeStorage } from "./safeStorage";

type Saved = { name: string; picture?: string };

const NAME = "test-storage";
const value: StorageValue<Saved> = { state: { name: "Emily", picture: "big-picture" }, version: 1 };
const shrink = (saved: StorageValue<Saved>) => ({ ...saved, state: { name: saved.state.name } });

const fail = (name: string) => () => {
  throw new DOMException("Storage failed.", name);
};

const readSaved = () => JSON.parse(localStorage.getItem(NAME)!) as StorageValue<Saved>;

describe("createSafeStorage", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("getItem", () => {
    it("should return the saved value", () => {
      localStorage.setItem(NAME, JSON.stringify(value));

      expect(createSafeStorage<Saved>().getItem(NAME)).toEqual(value);
    });

    it("should return null when nothing is saved", () => {
      expect(createSafeStorage<Saved>().getItem(NAME)).toBeNull();
    });

    it("should return null when the saved value is not valid JSON", () => {
      localStorage.setItem(NAME, "{not json");

      expect(createSafeStorage<Saved>().getItem(NAME)).toBeNull();
    });

    it("should return null when localStorage cannot be read", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(fail("SecurityError"));

      expect(createSafeStorage<Saved>().getItem(NAME)).toBeNull();
    });
  });

  describe("setItem", () => {
    it("should save the value as JSON", () => {
      void createSafeStorage<Saved>().setItem(NAME, value);

      expect(readSaved()).toEqual(value);
    });

    it.each(["QuotaExceededError", "NS_ERROR_DOM_QUOTA_REACHED"])(
      "should save the smaller form when the storage is full (%s)",
      (errorName) => {
        vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(fail(errorName));

        void createSafeStorage(shrink).setItem(NAME, value);

        expect(readSaved()).toEqual({ state: { name: "Emily" }, version: 1 });
      }
    );

    it("should not throw when even the smaller form cannot be saved", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(fail("QuotaExceededError"));

      expect(() => createSafeStorage(shrink).setItem(NAME, value)).not.toThrow();
    });

    it("should not retry for errors other than a full storage", () => {
      const setItem = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(fail("SecurityError"));

      expect(() => createSafeStorage(shrink).setItem(NAME, value)).not.toThrow();
      expect(setItem).toHaveBeenCalledOnce();
    });

    it("should not retry when no smaller form is given", () => {
      const setItem = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(fail("QuotaExceededError"));

      expect(() => createSafeStorage<Saved>().setItem(NAME, value)).not.toThrow();
      expect(setItem).toHaveBeenCalledOnce();
    });
  });

  describe("removeItem", () => {
    it("should remove the saved value", () => {
      localStorage.setItem(NAME, JSON.stringify(value));

      void createSafeStorage<Saved>().removeItem(NAME);

      expect(localStorage.getItem(NAME)).toBeNull();
    });

    it("should not throw when localStorage cannot be written", () => {
      vi.spyOn(Storage.prototype, "removeItem").mockImplementation(fail("SecurityError"));

      expect(() => createSafeStorage<Saved>().removeItem(NAME)).not.toThrow();
    });
  });
});
