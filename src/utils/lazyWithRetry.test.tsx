import { render, screen } from "@testing-library/react";
import { Suspense } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lazyWithRetry } from "./lazyWithRetry";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary";

const RELOAD_KEY = "chunk_load_retry_reloaded_TestPage";

const TestPage = () => <h1>Test page</h1>;

const chunkError = () => new TypeError("Failed to fetch dynamically imported module");

const renderLazy = (Component: React.ComponentType) =>
  render(
    <ErrorBoundary fallback={(error) => <p role="alert">{error.message}</p>}>
      <Suspense fallback={<p>Loading page</p>}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );

describe("lazyWithRetry", () => {
  const reload = vi.fn();

  beforeEach(() => {
    reload.mockReset();
    sessionStorage.clear();
    // React and the error boundary log the final chunk error
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe("When the chunk loads", () => {
    it("should render the component", async () => {
      const Page = lazyWithRetry(() => Promise.resolve({ default: TestPage }), "TestPage", reload);

      renderLazy(Page);

      expect(await screen.findByRole("heading", { name: "Test page" })).toBeInTheDocument();
      expect(reload).not.toHaveBeenCalled();
    });

    it("should clear the reload flag left by an earlier failure", async () => {
      sessionStorage.setItem(RELOAD_KEY, "true");
      const Page = lazyWithRetry(() => Promise.resolve({ default: TestPage }), "TestPage", reload);

      renderLazy(Page);
      await screen.findByRole("heading", { name: "Test page" });

      expect(sessionStorage.getItem(RELOAD_KEY)).toBeNull();
    });
  });

  describe("When the chunk fails for the first time", () => {
    it("should reload the page once and remember that it did", async () => {
      const Page = lazyWithRetry(() => Promise.reject(chunkError()), "TestPage", reload);

      renderLazy(Page);

      await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
      expect(sessionStorage.getItem(RELOAD_KEY)).toBe("true");
    });

    it("should keep showing the loading fallback instead of an error", async () => {
      const Page = lazyWithRetry(() => Promise.reject(chunkError()), "TestPage", reload);

      renderLazy(Page);
      await vi.waitFor(() => expect(reload).toHaveBeenCalled());

      expect(screen.getByText("Loading page")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("When the chunk fails again after a reload", () => {
    beforeEach(() => {
      sessionStorage.setItem(RELOAD_KEY, "true");
    });

    it("should not reload again", async () => {
      const Page = lazyWithRetry(() => Promise.reject(chunkError()), "TestPage", reload);

      renderLazy(Page);
      await screen.findByRole("alert");

      expect(reload).not.toHaveBeenCalled();
    });

    it("should throw the error so the error boundary can show it", async () => {
      const Page = lazyWithRetry(() => Promise.reject(chunkError()), "TestPage", reload);

      renderLazy(Page);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Failed to fetch dynamically imported module"
      );
    });
  });

  it("should track the reload flag separately for each page", async () => {
    sessionStorage.setItem("chunk_load_retry_reloaded_OtherPage", "true");
    const Page = lazyWithRetry(() => Promise.reject(chunkError()), "TestPage", reload);

    renderLazy(Page);

    await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
  });
});
