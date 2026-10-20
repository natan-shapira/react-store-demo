import ProductsList from "../../components/ProductsList/ProductsList";
import CategoriesNavbar from "../../components/CategoriesNavbar/CategoriesNavbar";
import { useSearchParams } from "react-router-dom";

function HomePage() {

  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");
  const handleSelectCategory = (slug: string | null) => {
    setSearchParams(slug ? { category: slug } : {});
  };
  
  return <div className="min-h-screen bg-gray-50" >
    <CategoriesNavbar selectedCategory={categorySlug} onSelectCategory={handleSelectCategory} />
    <ProductsList category={categorySlug} />
  </div>
}

export default HomePage;
