import { useState } from "react";
import { PRODUCTS_PER_PAGE, useProductsList } from "../../api/products";
import Pagination from "../Pagination/Pagination";
import ProductCard from "../ProductCard/ProductCard";
import { ProductGridSkeleton } from "../PageSkeletons/PageSkeletons";
import QueryError from "../QueryError/QueryError";

interface ProductsListProps {
  category: string | null;
}

function ProductsList({ category }: ProductsListProps) {
  const [prevCategory, setPrevCategory] = useState(category);
  const [page, setPage] = useState(0);

  if (category !== prevCategory) {
    setPrevCategory(category);
    setPage(0);
  }

  const { data, isLoading, isPlaceholderData, error, refetch } = useProductsList(category, page);

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

  const products = data?.products;
  const totalPages = data ? Math.ceil(data.total / PRODUCTS_PER_PAGE) : 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <ul
        className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 transition-opacity ${isPlaceholderData ? "opacity-50" : ""}`}
      >
        {products?.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        disabled={isPlaceholderData}
      />
    </div>
  );
}

export default ProductsList;
