import type { AdminView } from "../components/AdminViewNav/useAdminView";
import OrdersOverTimeView from "./views/OrdersOverTimeView/OrdersOverTimeView";
import OrdersTableView from "./views/OrdersTableView/OrdersTableView";
import StatusBreakdownView from "./views/StatusBreakdownView/StatusBreakdownView";

// Menu order; the first view is shown when none is chosen in the URL
export const ORDER_VIEWS = [
  { id: "status", label: "By status", View: StatusBreakdownView },
  { id: "over-time", label: "Over time", View: OrdersOverTimeView },
  { id: "table", label: "Orders table", View: OrdersTableView },
] as const satisfies readonly [AdminView, ...AdminView[]];
