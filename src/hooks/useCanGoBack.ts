import { useLocation } from "react-router-dom";

// React Router gives the first history entry the key "default". On that entry there is no in-app
// page to go back to: the user opened the app directly, from a bookmark or from another site.
export function useCanGoBack() {
  return useLocation().key !== "default";
}
