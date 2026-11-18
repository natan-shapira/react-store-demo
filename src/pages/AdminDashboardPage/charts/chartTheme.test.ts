import { describe, expect, it } from "vitest";
import { CHART_PALETTE, chartColor } from "./chartTheme";

describe("chartColor", () => {
  it("should give each position in the palette its own color", () => {
    expect(CHART_PALETTE.map((_, i) => chartColor(i))).toEqual(CHART_PALETTE);
  });

  it("should start the palette over after its last color", () => {
    expect(chartColor(CHART_PALETTE.length)).toBe(CHART_PALETTE[0]);
    expect(chartColor(CHART_PALETTE.length + 2)).toBe(CHART_PALETTE[2]);
  });
});
