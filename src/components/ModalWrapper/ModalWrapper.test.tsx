import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import ModalWrapper from "./ModalWrapper";
import { useModalStore } from "../../stores/useModalStore";

const openModal = () =>
  act(() => useModalStore.getState().openModal(<p>Modal body</p>, "Modal title"));

const renderModal = () => {
  const user = userEvent.setup();
  const { container } = render(<ModalWrapper />);
  return { user, getBackdrop: () => container.firstElementChild as HTMLElement };
};

const ModalBody = () => (
  <div>
    <button type="button">First action</button>
    <button type="button" disabled>
      Disabled action
    </button>
    <button type="button">Last action</button>
  </div>
);

const OpenButton = () => (
  <button
    type="button"
    onClick={() => useModalStore.getState().openModal(<ModalBody />, "Modal title")}
  >
    Open modal
  </button>
);

// Renders a real trigger, so focus starts on the element that opened the modal
const renderWithTrigger = async () => {
  const user = userEvent.setup();
  render(
    <>
      <OpenButton />
      <ModalWrapper />
    </>
  );
  const trigger = screen.getByRole("button", { name: "Open modal" });
  await user.click(trigger);
  return { user, trigger };
};

const getCloseButton = () => screen.getByRole("button", { name: "Close dialog" });
const getLastAction = () => screen.getByRole("button", { name: "Last action" });

describe("ModalWrapper", () => {
  beforeEach(() => {
    useModalStore.setState({ content: null, title: "" });
  });

  it("should render nothing when there is no content", () => {
    const { getBackdrop } = renderModal();

    expect(getBackdrop()).toBeNull();
  });

  it("should render the content from the modal store", () => {
    renderModal();
    openModal();

    expect(screen.getByText("Modal body")).toBeInTheDocument();
  });

  it("should show the title as the modal heading", () => {
    renderModal();
    openModal();

    expect(screen.getByRole("heading", { level: 2, name: "Modal title" })).toBeInTheDocument();
  });

  it("should use the title as the accessible name of the dialog", () => {
    renderModal();
    openModal();

    expect(screen.getByRole("dialog", { name: "Modal title" })).toHaveAttribute(
      "aria-modal",
      "true"
    );
  });

  it("should close when the backdrop is clicked", async () => {
    const { user, getBackdrop } = renderModal();
    openModal();

    await user.click(getBackdrop());

    expect(useModalStore.getState().content).toBeNull();
    expect(screen.queryByText("Modal body")).not.toBeInTheDocument();
  });

  it("should not close when the modal content is clicked", async () => {
    const { user } = renderModal();
    openModal();

    await user.click(screen.getByText("Modal body"));

    expect(screen.getByText("Modal body")).toBeInTheDocument();
  });

  it("should close when the close button is clicked", async () => {
    const { user } = renderModal();
    openModal();

    await user.click(screen.getByRole("button", { name: "Close dialog" }));

    expect(screen.queryByText("Modal body")).not.toBeInTheDocument();
  });

  describe("Keyboard", () => {
    it("should close when Escape is pressed", async () => {
      const { user } = renderModal();
      openModal();

      await user.keyboard("{Escape}");

      expect(useModalStore.getState().content).toBeNull();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should ignore other keys", async () => {
      const { user } = renderModal();
      openModal();

      await user.keyboard("{Enter}a");

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("Focus management", () => {
    it("should move focus into the dialog when it opens", async () => {
      await renderWithTrigger();

      expect(screen.getByRole("dialog", { name: "Modal title" })).toHaveFocus();
    });

    it("should return focus to the opening element when closed with Escape", async () => {
      const { user, trigger } = await renderWithTrigger();

      await user.keyboard("{Escape}");

      expect(trigger).toHaveFocus();
    });

    it("should return focus to the opening element when closed with the close button", async () => {
      const { user, trigger } = await renderWithTrigger();

      await user.click(getCloseButton());

      expect(trigger).toHaveFocus();
    });
  });

  describe("Focus trap", () => {
    it("should move focus from the last element to the first on Tab", async () => {
      const { user } = await renderWithTrigger();
      act(() => getLastAction().focus());

      await user.tab();

      expect(getCloseButton()).toHaveFocus();
    });

    it("should move focus from the first element to the last on Shift+Tab", async () => {
      const { user } = await renderWithTrigger();
      act(() => getCloseButton().focus());

      await user.tab({ shift: true });

      expect(getLastAction()).toHaveFocus();
    });

    it("should move focus to the last element on Shift+Tab from the dialog itself", async () => {
      const { user } = await renderWithTrigger();

      await user.tab({ shift: true });

      expect(getLastAction()).toHaveFocus();
    });

    it("should move normally between elements inside the dialog", async () => {
      const { user } = await renderWithTrigger();
      act(() => getCloseButton().focus());

      await user.tab();

      expect(screen.getByRole("button", { name: "First action" })).toHaveFocus();
    });

    it("should skip disabled buttons", async () => {
      const { user } = await renderWithTrigger();
      act(() => screen.getByRole("button", { name: "First action" }).focus());

      await user.tab();

      expect(getLastAction()).toHaveFocus();
    });

    it("should never move focus to elements outside the dialog", async () => {
      const { user, trigger } = await renderWithTrigger();

      for (let i = 0; i < 6; i++) {
        await user.tab();
        expect(trigger).not.toHaveFocus();
        expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
      }
    });
  });
});
