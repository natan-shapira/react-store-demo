import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./HomePage";
import { render, screen } from "@testing-library/react";
import { useCategories, useProductsList } from "../../api/products";
import type { Category, Product } from "../../types";

vi.mock("../../api/products", () => ({
  PRODUCTS_PER_PAGE: 15,
  useCategories: vi.fn(),
  useProductsList: vi.fn(),
}));

const categories: Category[] = [
  { slug: "beauty", name: "Beauty", url: "" },
  { slug: "laptops", name: "Laptops", url: "" },
];

const createProduct = (id: number, title: string, category: string): Product => ({
  id,
  title,
  category,
  price: 10,
  description: "",
  image: "",
});

const lipstick = createProduct(1, "Red Lipstick", "beauty");
const laptop = createProduct(2, "MacBook Pro", "laptops");

const productsByCategory: Record<string, Product[]> = {
  all: [lipstick, laptop],
  beauty: [lipstick],
  laptops: [laptop],
};

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{location.search}</div>;
};

const renderHomePage = (url = "/") => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HomePage />
              <LocationDisplay />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
  return { user };
};

const getSearch = () => screen.getByTestId("location").textContent;

describe("HomePage", () => {
  beforeEach(() => {
    vi.mocked(useCategories).mockReturnValue({ data: categories } as unknown as ReturnType<typeof useCategories>);
    vi.mocked(useProductsList).mockImplementation((category) => {
      const products = productsByCategory[category ?? "all"];
      return {
        data: { products, total: products.length },
        isLoading: false,
        isPlaceholderData: false,
        error: null,
      } as unknown as ReturnType<typeof useProductsList>;
    });
  });

  it("should render the categories bar and the products list", () => {
    renderHomePage();

    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Beauty" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Laptops" })).toBeInTheDocument();
    expect(screen.getByText("Red Lipstick")).toBeInTheDocument();
    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
  });

  it("should show all products when there is no category in the URL", () => {
    renderHomePage();

    expect(useProductsList).toHaveBeenLastCalledWith(null, 0);
    expect(screen.getByText("Red Lipstick")).toBeInTheDocument();
    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
  });

  it("should read the selected category from the ?category= URL parameter", () => {
    renderHomePage("/?category=beauty");

    expect(useProductsList).toHaveBeenLastCalledWith("beauty", 0);
    expect(screen.getByText("Red Lipstick")).toBeInTheDocument();
    expect(screen.queryByText("MacBook Pro")).not.toBeInTheDocument();
  });

  it("should add the category to the URL when a category is selected", async () => {
    const { user } = renderHomePage();

    await user.click(screen.getByRole("button", { name: "Laptops" }));

    expect(getSearch()).toBe("?category=laptops");
    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    expect(screen.queryByText("Red Lipstick")).not.toBeInTheDocument();
  });

  it('should remove the category from the URL when "All" is selected', async () => {
    const { user } = renderHomePage("/?category=beauty");

    await user.click(screen.getByRole("button", { name: "All" }));

    expect(getSearch()).toBe("");
    expect(screen.getByText("Red Lipstick")).toBeInTheDocument();
    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
  });
});
