import type { AdminView } from "../components/AdminViewNav/useAdminView";
import OrdersOverTimeView from "./views/OrdersOverTimeView/OrdersOverTimeView";
import OrdersTableView from "./views/OrdersTableView/OrdersTableView";
import StatusCountsView from "./views/StatusCountsView/StatusCountsView";
import StatusShareView from "./views/StatusShareView/StatusShareView";

// The views of the orders page, in menu order; the first one is shown when none is chosen.
// Each view fetches its own data, so only the chosen view sends a request.
export const ORDER_VIEWS = [
  { id: "counts", label: "Per status", View: StatusCountsView },
  { id: "share", label: "Status share", View: StatusShareView },
  { id: "over-time", label: "Over time", View: OrdersOverTimeView },
  { id: "table", label: "Orders table", View: OrdersTableView },
] as const satisfies readonly [AdminView, ...AdminView[]];
