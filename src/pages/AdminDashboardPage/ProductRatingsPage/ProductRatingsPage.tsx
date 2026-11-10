import AdminChartPage from "../AdminChartPage/AdminChartPage";

function ProductRatingsPage() {
  return (
    <AdminChartPage
      title="Product ratings"
      description="How the products are rated, from the rating field in GET /products."
      source="dummyjson"
    />
  );
}

export default ProductRatingsPage;
