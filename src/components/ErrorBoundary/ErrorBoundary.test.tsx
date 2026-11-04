import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

let shouldThrow = true;

const Bomb = () => {
  if (shouldThrow) {
    throw new Error("Boom");
  }
  return <p>Recovered content</p>;
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    shouldThrow = true;
    // React and the boundary both log caught errors; keep the test output readable
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the children when nothing throws", () => {
    shouldThrow = false;
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText("Recovered content")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  describe("Default fallback", () => {
    it("should show an alert with a heading and the error message", () => {
      render(
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Something went wrong");
      expect(alert).toHaveTextContent("Boom");
    });

    it("should render the children again after Try again", async () => {
      const user = userEvent.setup();
      render(
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      );

      shouldThrow = false;
      await user.click(screen.getByRole("button", { name: "Try again" }));

      expect(screen.getByText("Recovered content")).toBeInTheDocument();
    });

    it("should link back to the home page with a full page load", () => {
      render(
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      );

      expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
    });
  });

  describe("Custom fallback", () => {
    it("should pass the error and a reset function to the fallback", async () => {
      const user = userEvent.setup();
      const fallback = vi.fn((error: Error, reset: () => void) => (
        <button type="button" onClick={reset}>
          Custom: {error.message}
        </button>
      ));
      render(
        <ErrorBoundary fallback={fallback}>
          <Bomb />
        </ErrorBoundary>
      );

      expect(screen.getByRole("button", { name: "Custom: Boom" })).toBeInTheDocument();

      shouldThrow = false;
      await user.click(screen.getByRole("button", { name: "Custom: Boom" }));

      expect(screen.getByText("Recovered content")).toBeInTheDocument();
    });
  });

  describe("resetKey", () => {
    it("should clear the error when the reset key changes", () => {
      const { rerender } = render(
        <ErrorBoundary resetKey="/products/1">
          <Bomb />
        </ErrorBoundary>
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();

      shouldThrow = false;
      rerender(
        <ErrorBoundary resetKey="/cart">
          <Bomb />
        </ErrorBoundary>
      );

      expect(screen.getByText("Recovered content")).toBeInTheDocument();
    });

    it("should keep showing the error while the reset key stays the same", () => {
      const { rerender } = render(
        <ErrorBoundary resetKey="/products/1">
          <Bomb />
        </ErrorBoundary>
      );

      shouldThrow = false;
      rerender(
        <ErrorBoundary resetKey="/products/1">
          <Bomb />
        </ErrorBoundary>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("should log the caught error", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      "Uncaught error:",
      expect.objectContaining({ message: "Boom" }),
      expect.any(String)
    );
  });
});
