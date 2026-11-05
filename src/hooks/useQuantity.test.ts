import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useQuantity } from "./useQuantity";

describe("useQuantity", () => {
  it("should start at 1", () => {
    const { result } = renderHook(() => useQuantity());

    expect(result.current.quantity).toBe(1);
  });

  it("should increase by one", () => {
    const { result } = renderHook(() => useQuantity());

    act(() => result.current.increase());
    act(() => result.current.increase());

    expect(result.current.quantity).toBe(3);
  });

  it("should decrease by one", () => {
    const { result } = renderHook(() => useQuantity());
    act(() => result.current.increase());

    act(() => result.current.decrease());

    expect(result.current.quantity).toBe(1);
  });

  it("should not go below 1", () => {
    const { result } = renderHook(() => useQuantity());

    act(() => result.current.decrease());

    expect(result.current.quantity).toBe(1);
  });

  it("should reset to 1", () => {
    const { result } = renderHook(() => useQuantity());
    act(() => result.current.increase());
    act(() => result.current.increase());

    act(() => result.current.reset());

    expect(result.current.quantity).toBe(1);
  });
});
