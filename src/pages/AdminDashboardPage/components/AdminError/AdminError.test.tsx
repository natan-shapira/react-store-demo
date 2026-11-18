import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AdminError from "./AdminError";
import { ApiError, NETWORK_ERROR_STATUS } from "../../../../api/ApiError";

describe("AdminError", () => {
  it("should announce the error message", () => {
    render(
      <AdminError
        error={new ApiError("Internal server error", 500)}
        fallbackMessage="Failed to load orders"
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Internal server error");
  });

  it("should call onRetry when Try again is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <AdminError
        error={new ApiError("Could not reach the server", NETWORK_ERROR_STATUS)}
        fallbackMessage="Failed to load orders"
        onRetry={onRetry}
      />
    );

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
