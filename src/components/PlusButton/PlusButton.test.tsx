import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PlusButton from "./PlusButton";

describe("PlusButton", () => {
  it('should be labelled "Increase quantity" by default', () => {
    render(<PlusButton onClick={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeInTheDocument();
  });

  it("should use a custom label when one is given", () => {
    render(<PlusButton onClick={vi.fn()} ariaLabel="Add one more" />);

    expect(screen.getByRole("button", { name: "Add one more" })).toBeInTheDocument();
  });

  it("should call onClick once per click", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<PlusButton onClick={onClick} />);

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("should not submit a surrounding form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <PlusButton onClick={vi.fn()} />
      </form>
    );

    await user.click(screen.getByRole("button"));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
