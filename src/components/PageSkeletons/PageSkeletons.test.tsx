import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import {
  AuthSkeleton,
  CartSkeleton,
  CheckoutSkeleton,
  HomeSkeleton,
  ProductGridSkeleton,
  ProductSkeleton,
} from "./PageSkeletons";

const skeletons: { name: string; Skeleton: ComponentType; label: string }[] = [
  { name: "HomeSkeleton", Skeleton: HomeSkeleton, label: "Loading products" },
  { name: "ProductGridSkeleton", Skeleton: ProductGridSkeleton, label: "Loading products" },
  { name: "ProductSkeleton", Skeleton: ProductSkeleton, label: "Loading product" },
  { name: "CartSkeleton", Skeleton: CartSkeleton, label: "Loading cart" },
  { name: "CheckoutSkeleton", Skeleton: CheckoutSkeleton, label: "Loading checkout" },
  { name: "AuthSkeleton", Skeleton: AuthSkeleton, label: "Loading sign in" },
];

describe("PageSkeletons", () => {
  describe.each(skeletons)("$name", ({ Skeleton, label }) => {
    it(`should announce "${label}" to screen readers`, () => {
      render(<Skeleton />);

      expect(screen.getByRole("status", { name: label })).toHaveAttribute("aria-busy", "true");
    });

    it("should pulse, unless the user prefers reduced motion", () => {
      render(<Skeleton />);

      expect(screen.getByRole("status")).toHaveClass("animate-pulse", "motion-reduce:animate-none");
    });

    it("should not expose any interactive or text content", () => {
      render(<Skeleton />);

      expect(screen.getByRole("status")).toHaveTextContent("");
      expect(screen.queryAllByRole("button")).toHaveLength(0);
      expect(screen.queryAllByRole("link")).toHaveLength(0);
    });
  });

  it("should render a placeholder card for each product in the home grid", () => {
    const { container } = render(<HomeSkeleton />);

    // Placeholder cards are decorative and have no role or text, so only their markup can be counted
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll(".grid > div")).toHaveLength(12);
  });
});
