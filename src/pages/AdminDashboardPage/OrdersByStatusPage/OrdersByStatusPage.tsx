import AdminChartPage from "../AdminChartPage/AdminChartPage";
import AdminViewNav from "../components/AdminViewNav/AdminViewNav";
import { useAdminView } from "../components/AdminViewNav/useAdminView";
import { ORDER_VIEWS } from "./orderViews";

function OrdersByStatusPage() {
  const { id, View } = useAdminView(ORDER_VIEWS);

  return (
    <AdminChartPage
      title="Orders by status"
      description="Orders by status (pending, shipped, delivered, cancelled). DummyJSON has no orders, so these views use sample data until the project has its own server."
      source="sample"
    >
      <AdminViewNav label="Order views" views={ORDER_VIEWS} activeId={id} />
      <View />
    </AdminChartPage>
  );
}

export default OrdersByStatusPage;
