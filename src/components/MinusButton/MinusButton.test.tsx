import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MinusButton from "./MinusButton";

describe("MinusButton", () => {
  it('should be labelled "Decrease quantity" by default', () => {
    render(<MinusButton onClick={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeInTheDocument();
  });

  it("should use a custom label when one is given", () => {
    render(<MinusButton onClick={vi.fn()} ariaLabel="Remove one" />);

    expect(screen.getByRole("button", { name: "Remove one" })).toBeInTheDocument();
  });

  it("should call onClick once per click", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<MinusButton onClick={onClick} />);

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("should not submit a surrounding form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <MinusButton onClick={vi.fn()} />
      </form>
    );

    await user.click(screen.getByRole("button"));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
