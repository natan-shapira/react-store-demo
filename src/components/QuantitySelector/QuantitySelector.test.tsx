import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import QuantitySelector from "./QuantitySelector";
import { getQuantity } from "../../test/queries";

const renderSelector = (value = 3) => {
  const user = userEvent.setup();
  const onIncrease = vi.fn();
  const onDecrease = vi.fn();
  render(<QuantitySelector value={value} onIncrease={onIncrease} onDecrease={onDecrease} />);
  return { user, onIncrease, onDecrease };
};

describe("QuantitySelector", () => {
  it("should show the value with a label for screen readers", () => {
    renderSelector(3);

    expect(getQuantity()).toBe(3);
  });

  it("should call onIncrease when the plus button is clicked", async () => {
    const { user, onIncrease, onDecrease } = renderSelector();

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));

    expect(onIncrease).toHaveBeenCalledOnce();
    expect(onDecrease).not.toHaveBeenCalled();
  });

  it("should call onDecrease when the minus button is clicked", async () => {
    const { user, onIncrease, onDecrease } = renderSelector();

    await user.click(screen.getByRole("button", { name: "Decrease quantity" }));

    expect(onDecrease).toHaveBeenCalledOnce();
    expect(onIncrease).not.toHaveBeenCalled();
  });
});
