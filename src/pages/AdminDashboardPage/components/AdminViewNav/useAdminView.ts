import type { ComponentType } from "react";
import { useSearchParams } from "react-router-dom";

// One of the ways a section page can show its data, e.g. a chart or a table
export interface AdminView {
  // Kept in the address as ?view=<id>, so a view can be linked to and Back returns to the last one
  id: string;
  label: string;
  View: ComponentType;
}

export const VIEW_PARAM = "view";

// The view named in the address, or the first one when the address names none or an unknown one
export function useAdminView<V extends readonly [AdminView, ...AdminView[]]>(views: V): V[number] {
  const [searchParams] = useSearchParams();
  const id = searchParams.get(VIEW_PARAM);
  return views.find((view) => view.id === id) ?? views[0];
}
