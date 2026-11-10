import AdminChartPage from "../AdminChartPage/AdminChartPage";

function UsersPage() {
  return (
    <AdminChartPage
      title="Users"
      description="Users by role, gender and age group, from GET /users."
      source="dummyjson"
    />
  );
}

export default UsersPage;
