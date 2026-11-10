import AdminChartPage from "../AdminChartPage/AdminChartPage";

function ProductsByCategoryPage() {
  return (
    <AdminChartPage
      title="Products by category"
      description="How the catalog's products are spread across categories, from GET /products."
      source="dummyjson"
    />
  );
}

export default ProductsByCategoryPage;
