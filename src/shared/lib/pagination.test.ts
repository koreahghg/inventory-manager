import { describe, expect, it } from "vitest";
import { paginate, rangeFor } from "./pagination";

describe("rangeFor", () => {
  it("computes a zero-based inclusive range for page 1", () => {
    expect(rangeFor(1, 20)).toEqual([0, 19]);
  });

  it("computes the range for a later page", () => {
    expect(rangeFor(3, 20)).toEqual([40, 59]);
  });
});

describe("paginate", () => {
  it("computes totalPages from totalCount and pageSize", () => {
    const result = paginate(["a", "b"], 1, 45, 20);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(1);
    expect(result.rows).toEqual(["a", "b"]);
  });

  it("always returns at least 1 page even with zero rows", () => {
    const result = paginate([], 1, 0, 20);
    expect(result.totalPages).toBe(1);
  });
});
