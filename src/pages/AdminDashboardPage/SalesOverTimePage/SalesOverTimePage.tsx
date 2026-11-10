import AdminChartPage from "../AdminChartPage/AdminChartPage";

function SalesOverTimePage() {
  return (
    <AdminChartPage
      title="Sales over time"
      description="Revenue by month. DummyJSON has no orders, so this chart will use sample data until the project has its own server."
      source="sample"
    />
  );
}

export default SalesOverTimePage;
