import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePageMeta } from "./usePageMeta";

function TestPage({ title, withHeading = true }: { title: string; withHeading?: boolean }) {
  const headingRef = usePageMeta(title);
  return withHeading ? (
    <h1 ref={headingRef} tabIndex={-1}>
      {title}
    </h1>
  ) : (
    <p>No heading</p>
  );
}

describe("usePageMeta", () => {
  it("should set the document title with the app name", () => {
    render(<TestPage title="Cart" />);

    expect(document.title).toBe("Cart | ReactShop");
  });

  it("should move focus to the page heading", () => {
    render(<TestPage title="Cart" />);

    expect(screen.getByRole("heading", { name: "Cart" })).toHaveFocus();
  });

  it("should update the title and focus the heading again when the title changes", () => {
    const { rerender } = render(<TestPage title="Sign in" />);
    screen.getByRole("heading").blur();

    rerender(<TestPage title="Sign up" />);

    expect(document.title).toBe("Sign up | ReactShop");
    expect(screen.getByRole("heading", { name: "Sign up" })).toHaveFocus();
  });

  it("should not take focus from an open modal dialog", () => {
    render(
      <div role="dialog" aria-modal="true">
        <button type="button">Got it</button>
      </div>
    );
    screen.getByRole("button", { name: "Got it" }).focus();

    render(<TestPage title="Cart" />);

    expect(document.title).toBe("Cart | ReactShop");
    expect(screen.getByRole("button", { name: "Got it" })).toHaveFocus();
  });

  it("should still set the title when the page has no heading yet", () => {
    render(<TestPage title="Product" withHeading={false} />);

    expect(document.title).toBe("Product | ReactShop");
    expect(document.body).toHaveFocus();
  });
});
