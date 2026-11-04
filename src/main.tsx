import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { configureAuth } from "./api/fetchWithAuth.ts";
import { useAuthStore } from "./stores/useAuthStore.ts";

// The API layer cannot import the auth store without a circular dependency, so the store is injected here
configureAuth({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => useAuthStore.getState().logout(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Last line of defence for errors outside the pages, e.g. in the navbar or providers */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
