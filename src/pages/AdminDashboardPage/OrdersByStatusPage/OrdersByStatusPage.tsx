import AdminChartPage from "../AdminChartPage/AdminChartPage";

function OrdersByStatusPage() {
  return (
    <AdminChartPage
      title="Orders by status"
      description="Orders by status (pending, shipped, delivered, cancelled). DummyJSON has no orders, so this chart will use sample data until the project has its own server."
      source="sample"
    />
  );
}

export default OrdersByStatusPage;
