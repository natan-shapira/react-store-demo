import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import QueryError from "./QueryError";
import { ApiError, NETWORK_ERROR_STATUS } from "../../api/ApiError";

const renderError = (error: unknown, onRetry = vi.fn()) => {
  const user = userEvent.setup();
  render(
    <QueryError error={error} fallbackMessage="Failed to load products" onRetry={onRetry}>
      <button type="button">Go back</button>
    </QueryError>
  );
  return { user, onRetry };
};

describe("QueryError", () => {
  it("should announce the error message", () => {
    renderError(new ApiError("Internal server error", 500));

    expect(screen.getByRole("alert")).toHaveTextContent("Internal server error");
  });

  it("should show the fallback message when the error has none", () => {
    renderError(new Error(""));

    expect(screen.getByRole("alert")).toHaveTextContent("Failed to load products");
  });

  it("should call onRetry when Try again is clicked", async () => {
    const { user, onRetry } = renderError(new TypeError("Failed to fetch"));

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("should offer to try again after a network error", () => {
    renderError(new ApiError("Could not reach the server", NETWORK_ERROR_STATUS));

    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("should not offer to try again for an error that will fail again", () => {
    renderError(new ApiError("Product not found", 404));

    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
  });

  it("should show the extra actions it is given", () => {
    renderError(new ApiError("Product not found", 404));

    expect(screen.getByRole("button", { name: "Go back" })).toBeInTheDocument();
  });
});
