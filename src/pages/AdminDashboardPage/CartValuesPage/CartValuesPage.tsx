import AdminChartPage from "../AdminChartPage/AdminChartPage";

function CartValuesPage() {
  return (
    <AdminChartPage
      title="Cart values"
      description="Cart totals before and after discounts, from GET /carts."
      source="dummyjson"
    />
  );
}

export default CartValuesPage;
