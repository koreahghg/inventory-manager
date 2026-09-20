import { describe, expect, it, vi } from "vitest";
import { daysSince, isStaleInventory, STALE_INVENTORY_DAYS } from "./stale";

describe("daysSince", () => {
  it("computes whole days elapsed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-20T00:00:00Z"));
    expect(daysSince("2026-09-10T00:00:00Z")).toBe(10);
    vi.useRealTimers();
  });
});

describe("isStaleInventory", () => {
  it("returns false when there is no available purchase date", () => {
    expect(isStaleInventory(null)).toBe(false);
  });

  it(`returns true at or beyond ${STALE_INVENTORY_DAYS} days`, () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-20T00:00:00Z"));
    const exactlyThreshold = new Date();
    exactlyThreshold.setDate(exactlyThreshold.getDate() - STALE_INVENTORY_DAYS);
    expect(isStaleInventory(exactlyThreshold.toISOString())).toBe(true);
    vi.useRealTimers();
  });

  it("returns false for recent stock", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-20T00:00:00Z"));
    expect(isStaleInventory("2026-09-19T00:00:00Z")).toBe(false);
    vi.useRealTimers();
  });
});
