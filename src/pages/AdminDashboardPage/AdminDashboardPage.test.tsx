import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AdminDashboardPage from "./AdminDashboardPage";

describe("AdminDashboardPage", () => {
  it('should set the title to "Admin dashboard" and focus the heading', () => {
    render(<AdminDashboardPage />);

    expect(document.title).toBe("Admin dashboard | ReactShop");
    expect(screen.getByRole("heading", { level: 1, name: "Admin dashboard" })).toHaveFocus();
  });
});
