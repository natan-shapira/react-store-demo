import { lazy } from "react";

const reloadPage = () => window.location.reload();

// A chunk can fail to load after a new deploy removed it; one full reload fetches the new chunk names.
// The sessionStorage flag stops a chunk that keeps failing from reloading the page forever.
export function lazyWithRetry<T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  reload: () => void = reloadPage
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const hasReloadedKey = `chunk_load_retry_reloaded_${componentName}`;
    try {
      const component = await importFn();
      sessionStorage.removeItem(hasReloadedKey);
      return component;
    } catch (error) {
      if (!sessionStorage.getItem(hasReloadedKey)) {
        sessionStorage.setItem(hasReloadedKey, "true");
        reload();
        // Keep the Suspense fallback on screen until the page actually reloads
        return new Promise<never>(() => {});
      }
      throw error;
    }
  });
}
