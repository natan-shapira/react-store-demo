import { createElement } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { useModalStore } from "./useModalStore";

const firstContent = createElement("p", null, "First modal");
const secondContent = createElement("p", null, "Second modal");

describe("useModalStore", () => {
  beforeEach(() => {
    useModalStore.setState(useModalStore.getInitialState(), true);
  });

  it("should start with no content and an empty title", () => {
    const { content, title } = useModalStore.getInitialState();

    expect(content).toBeNull();
    expect(title).toBe("");
  });

  it("should set the content and title when openModal is called", () => {
    useModalStore.getState().openModal(firstContent, "First title");

    expect(useModalStore.getState().content).toBe(firstContent);
    expect(useModalStore.getState().title).toBe("First title");
  });

  it("should replace the content and title when openModal is called again", () => {
    useModalStore.getState().openModal(firstContent, "First title");
    useModalStore.getState().openModal(secondContent, "Second title");

    expect(useModalStore.getState().content).toBe(secondContent);
    expect(useModalStore.getState().title).toBe("Second title");
  });

  it("should clear the content and title when closeModal is called", () => {
    useModalStore.getState().openModal(firstContent, "First title");

    useModalStore.getState().closeModal();

    expect(useModalStore.getState().content).toBeNull();
    expect(useModalStore.getState().title).toBe("");
  });

  it("should keep the content null when closeModal is called on a closed modal", () => {
    useModalStore.getState().closeModal();

    expect(useModalStore.getState().content).toBeNull();
  });

  it("should accept plain text as content", () => {
    useModalStore.getState().openModal("Simple message", "Notice");

    expect(useModalStore.getState().content).toBe("Simple message");
  });

  it("should notify subscribers when the content changes", () => {
    const contents: unknown[] = [];
    const unsubscribe = useModalStore.subscribe((state) => contents.push(state.content));

    useModalStore.getState().openModal(firstContent, "First title");
    useModalStore.getState().closeModal();
    unsubscribe();

    expect(contents).toEqual([firstContent, null]);
  });
});
