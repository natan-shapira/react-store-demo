import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NoItemsModalContent, {
  AUTO_CLOSE_MS,
  NO_ITEMS_MODAL_DESCRIPTION_ID,
  NO_ITEMS_MODAL_TITLE,
} from "./NoItemsModalContent";
import ModalWrapper from "../../components/ModalWrapper/ModalWrapper";
import { useModalStore } from "../../stores/useModalStore";

const openNoItemsModal = () => {
  const user = userEvent.setup();
  render(<ModalWrapper />);
  act(() =>
    useModalStore.getState().openModal(<NoItemsModalContent />, NO_ITEMS_MODAL_TITLE, {
      descriptionId: NO_ITEMS_MODAL_DESCRIPTION_ID,
    })
  );
  return { user };
};

describe("NoItemsModalContent", () => {
  beforeEach(() => {
    useModalStore.getState().closeModal();
  });

  it("should be named by its title", () => {
    openNoItemsModal();

    expect(screen.getByRole("dialog", { name: NO_ITEMS_MODAL_TITLE })).toBeInTheDocument();
  });

  it("should have a single heading, the one rendered by the modal", () => {
    openNoItemsModal();

    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });

  it("should describe the dialog with how to reach checkout", () => {
    openNoItemsModal();

    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
      "Select at least one item in your cart, then choose “Proceed to checkout” to review your order."
    );
  });

  it("should close the modal when Got it is clicked", async () => {
    const { user } = openNoItemsModal();

    await user.click(screen.getByRole("button", { name: "Got it" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(useModalStore.getState().content).toBeNull();
  });

  it("should tell the user that it closes automatically", () => {
    openNoItemsModal();

    expect(screen.getByText("This message closes automatically.")).toBeInTheDocument();
  });

  describe("Auto close", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const advance = (ms: number) =>
      act(() => {
        vi.advanceTimersByTime(ms);
      });
    const openOtherModal = () =>
      act(() => useModalStore.getState().openModal(<p>Other content</p>, "Other modal"));

    it("should stay open until the delay has passed", () => {
      openNoItemsModal();

      advance(AUTO_CLOSE_MS - 1);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should close once the delay has passed", () => {
      openNoItemsModal();

      advance(AUTO_CLOSE_MS);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // user-event waits on timers between actions, and fake timers only move when the test advances them,
    // so this test uses fireEvent, which dispatches the events immediately
    it("should stay open while the pointer is over it, and close after it leaves", () => {
      openNoItemsModal();
      const dialog = screen.getByRole("dialog");

      fireEvent.pointerEnter(dialog);
      advance(AUTO_CLOSE_MS * 2);
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      fireEvent.pointerLeave(dialog);
      advance(AUTO_CLOSE_MS);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should stay open while a control inside it has keyboard focus", () => {
      openNoItemsModal();

      act(() => screen.getByRole("button", { name: "Got it" }).focus());
      advance(AUTO_CLOSE_MS * 2);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not close another modal that replaced it", () => {
      openNoItemsModal();

      openOtherModal();
      advance(AUTO_CLOSE_MS);

      expect(screen.getByRole("dialog", { name: "Other modal" })).toBeInTheDocument();
    });

    it("should not close a modal opened after it was closed manually", () => {
      openNoItemsModal();

      act(() => useModalStore.getState().closeModal());
      openOtherModal();
      advance(AUTO_CLOSE_MS);

      expect(screen.getByRole("dialog", { name: "Other modal" })).toBeInTheDocument();
    });
  });
});
