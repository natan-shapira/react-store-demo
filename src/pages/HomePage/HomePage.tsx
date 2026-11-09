import ProductsList from "../../components/ProductsList/ProductsList";
import CategoriesNavbar from "../../components/CategoriesNavbar/CategoriesNavbar";
import { useSearchParams } from "react-router-dom";
import { usePageMeta } from "../../hooks/usePageMeta";

function HomePage() {
  const headingRef = usePageMeta("Products");
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");
  // Replacing all the search params also drops ?page, so a new category starts on its first page
  const handleSelectCategory = (slug: string | null) => {
    setSearchParams(slug ? { category: slug } : {});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* The catalog has no visible title, but every page needs an h1 for screen readers and focus */}
      <h1 ref={headingRef} tabIndex={-1} className="sr-only">
        Products
      </h1>
      <CategoriesNavbar selectedCategory={categorySlug} onSelectCategory={handleSelectCategory} />
      <ProductsList category={categorySlug} />
    </div>
  );
}

export default HomePage;
