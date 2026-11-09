import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useCanGoBack } from "./useCanGoBack";

// entries is the browser history; the hook runs on the last one
const renderWithHistory = (entries: string[]) => {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(
      MemoryRouter,
      { initialEntries: entries, initialIndex: entries.length - 1 },
      children
    );
  return renderHook(() => ({ canGoBack: useCanGoBack(), navigate: useNavigate() }), { wrapper });
};

describe("useCanGoBack", () => {
  it("should be false on the first page the app was opened on", () => {
    const { result } = renderWithHistory(["/products/5"]);

    expect(result.current.canGoBack).toBe(false);
  });

  it("should be true when there is an earlier page in the app", () => {
    const { result } = renderWithHistory(["/", "/products/5"]);

    expect(result.current.canGoBack).toBe(true);
  });

  it("should become true after navigating inside the app", () => {
    const { result } = renderWithHistory(["/"]);

    act(() => {
      void result.current.navigate("/cart");
    });

    expect(result.current.canGoBack).toBe(true);
  });
});
