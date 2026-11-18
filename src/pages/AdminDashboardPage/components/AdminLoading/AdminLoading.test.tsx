import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AdminLoading from "./AdminLoading";

describe("AdminLoading", () => {
  it("should announce what is loading", () => {
    render(<AdminLoading label="Loading order statuses" />);

    expect(screen.getByRole("status", { name: "Loading order statuses" })).toHaveAttribute(
      "aria-busy",
      "true"
    );
  });
});
