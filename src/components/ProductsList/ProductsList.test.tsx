import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductsList from "./ProductsList";
import { useProductsList } from "../../api/products";
import { createProduct } from "../../test/factories";

vi.mock("../../api/products", () => ({
  PRODUCTS_PER_PAGE: 15,
  useProductsList: vi.fn(),
}));

const products = [createProduct({ id: 1 }), createProduct({ id: 2 })];

const mockQuery = (overrides: Record<string, unknown> = {}) =>
  vi.mocked(useProductsList).mockReturnValue({
    data: { products, total: 40 },
    isLoading: false,
    isPlaceholderData: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useProductsList>);

const LocationDisplay = () => {
  const { pathname, search } = useLocation();
  return <div data-testid="location">{pathname + search}</div>;
};

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => void navigate(-1)}>
      Back
    </button>
  );
};

// entries is the browser history; the list starts on the last one
const renderList = ({
  category = null,
  entries = ["/"],
}: { category?: string | null; entries?: string[] } = {}) => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <ProductsList category={category} />
      <LocationDisplay />
      <BackButton />
    </MemoryRouter>
  );
  return { user };
};

const getLocation = () => screen.getByTestId("location").textContent;
const getPagination = () => screen.getByRole("navigation", { name: "Pagination" });
const getPageButton = (page: string) => within(getPagination()).getByRole("button", { name: page });

const mockScrollTo = () => vi.spyOn(window, "scrollTo").mockImplementation(() => {});

describe("ProductsList", () => {
  let scrollTo: ReturnType<typeof mockScrollTo>;

  beforeEach(() => {
    vi.mocked(useProductsList).mockReset();
    mockQuery();
    scrollTo = mockScrollTo();
  });

  describe("Loading and errors", () => {
    it("should show the products skeleton while loading", () => {
      mockQuery({ isLoading: true, data: undefined });
      renderList();

      expect(screen.getByRole("status", { name: "Loading products" })).toBeInTheDocument();
    });

    it("should show the error message when the request fails", () => {
      mockQuery({ error: new Error("Network error"), data: undefined });
      renderList();

      expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    });

    it("should request the products again when Try again is clicked", async () => {
      const refetch = vi.fn();
      mockQuery({ error: new Error("Network error"), data: undefined, refetch });
      const { user } = renderList();

      await user.click(screen.getByRole("button", { name: "Try again" }));

      expect(refetch).toHaveBeenCalledOnce();
    });
  });

  describe("Products", () => {
    it("should render a card for each product", () => {
      renderList();

      expect(screen.getAllByRole("listitem")).toHaveLength(2);
      expect(screen.getByRole("heading", { name: "Product 1" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Product 2" })).toBeInTheDocument();
    });

    it("should request the products of the given category", () => {
      renderList({ category: "beauty" });

      expect(useProductsList).toHaveBeenLastCalledWith("beauty", 0);
    });

    it("should dim the list while the next page is loading", () => {
      mockQuery({ isPlaceholderData: true });
      renderList();

      expect(screen.getByRole("list")).toHaveClass("opacity-50");
    });
  });

  describe("Pagination", () => {
    it("should calculate the number of pages from the total", () => {
      renderList();

      const pagination = getPagination();
      expect(within(pagination).getByRole("button", { name: "3" })).toBeInTheDocument();
      expect(within(pagination).queryByRole("button", { name: "4" })).not.toBeInTheDocument();
    });

    it("should request the selected page and keep it in the URL", async () => {
      const { user } = renderList();

      await user.click(getPageButton("2"));

      expect(useProductsList).toHaveBeenLastCalledWith(null, 1);
      expect(getLocation()).toBe("/?page=2");
      expect(getPageButton("2")).toHaveAttribute("aria-current", "page");
    });

    it("should start on the page given in the URL", () => {
      renderList({ entries: ["/?page=3"] });

      expect(useProductsList).toHaveBeenLastCalledWith(null, 2);
      expect(getPageButton("3")).toHaveAttribute("aria-current", "page");
    });

    it("should leave the page out of the URL for the first page", async () => {
      const { user } = renderList({ entries: ["/?page=3"] });

      await user.click(getPageButton("1"));

      expect(getLocation()).toBe("/");
    });

    it("should keep the other search params when the page changes", async () => {
      const { user } = renderList({ category: "beauty", entries: ["/?category=beauty"] });

      await user.click(getPageButton("2"));

      expect(getLocation()).toBe("/?category=beauty&page=2");
    });

    it.each(["-2", "0", "1.5", "abc"])("should treat ?page=%s as the first page", (value) => {
      renderList({ entries: [`/?page=${value}`] });

      expect(useProductsList).toHaveBeenLastCalledWith(null, 0);
    });

    it("should show the last page instead of a page past the end", () => {
      renderList({ entries: ["/?page=99"] });

      expect(getLocation()).toBe("/?page=3");
      expect(useProductsList).toHaveBeenLastCalledWith(null, 2);
    });

    it("should not keep a page past the end in the browser history", async () => {
      const { user } = renderList({ entries: ["/start", "/?page=99"] });

      await user.click(screen.getByRole("button", { name: "Back" }));

      expect(getLocation()).toBe("/start");
    });

    it("should scroll to the top when the page changes", async () => {
      const { user } = renderList();

      await user.click(getPageButton("Next"));

      expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    });

    it("should disable the pagination while the next page is loading", () => {
      mockQuery({ isPlaceholderData: true });
      renderList();

      within(getPagination())
        .getAllByRole("button")
        .forEach((button) => expect(button).toBeDisabled());
    });
  });
});
