import { Navigate, useSearchParams } from "react-router-dom";
import { PRODUCTS_PER_PAGE, useProductsList } from "../../api/products";
import Pagination from "../Pagination/Pagination";
import ProductCard from "../ProductCard/ProductCard";
import { ProductGridSkeleton } from "../PageSkeletons/PageSkeletons";
import QueryError from "../QueryError/QueryError";

const FIRST_PAGE = 1;

// The page is kept in the URL (?page=3), so it survives a refresh and can be shared.
// Anything that is not a whole number from 1 up counts as the first page.
const parsePage = (value: string | null) => {
  const page = Number(value);
  return Number.isInteger(page) && page >= FIRST_PAGE ? page : FIRST_PAGE;
};

// The first page is the default, so it is left out of the URL instead of being written as ?page=1
const withPage = (params: URLSearchParams, page: number) => {
  const next = new URLSearchParams(params);
  if (page === FIRST_PAGE) next.delete("page");
  else next.set("page", String(page));
  return next;
};

interface ProductsListProps {
  category: string | null;
}

function ProductsList({ category }: ProductsListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  // The URL counts pages from 1, the API and Pagination from 0
  const { data, isLoading, isPlaceholderData, error, refetch } = useProductsList(
    category,
    page - 1
  );

  if (isLoading) return <ProductGridSkeleton />;
  if (error) {
    return (
      <QueryError
        error={error}
        fallbackMessage="Failed to load products"
        onRetry={() => refetch()}
      />
    );
  }

  const totalPages = data ? Math.ceil(data.total / PRODUCTS_PER_PAGE) : 0;

  // A page past the end (an old link, or a category that now has fewer products) shows the last page.
  // replace keeps the out-of-range address out of the browser history.
  if (totalPages > 0 && page > totalPages) {
    return <Navigate to={{ search: withPage(searchParams, totalPages).toString() }} replace />;
  }

  const handlePageChange = (pageIndex: number) => {
    setSearchParams((params) => withPage(params, pageIndex + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <ul
        className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 transition-opacity ${isPlaceholderData ? "opacity-50" : ""}`}
      >
        {data?.products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
      <Pagination
        page={page - 1}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        disabled={isPlaceholderData}
      />
    </div>
  );
}

export default ProductsList;
