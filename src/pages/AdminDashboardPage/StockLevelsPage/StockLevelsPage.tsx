import AdminChartPage from "../AdminChartPage/AdminChartPage";

function StockLevelsPage() {
  return (
    <AdminChartPage
      title="Stock levels"
      description="How much stock is left for each product, with low-stock products highlighted, from the stock field in GET /products."
      source="dummyjson"
    />
  );
}

export default StockLevelsPage;
