import { describe, expect, it } from "vitest";
import { calculateMatchedPurchaseCost, calculateNetProfit } from "./profit";

describe("calculateMatchedPurchaseCost", () => {
  it("multiplies quantity by unit price", () => {
    expect(calculateMatchedPurchaseCost(3, 10000)).toBe(30000);
  });

  it("returns 0 for zero quantity", () => {
    expect(calculateMatchedPurchaseCost(0, 10000)).toBe(0);
  });
});

describe("calculateNetProfit", () => {
  it("computes 판매금액 - 수수료 - 배송비 - 기타비용 (매입원가는 매입 시점에 별도로 차감됨)", () => {
    const profit = calculateNetProfit({
      salePrice: 100000,
      fee: 5000,
      shippingFee: 3000,
      otherFee: 1000,
    });
    // 100000 - 5000 - 3000 - 1000 = 91000
    expect(profit).toBe(91000);
  });

  it("can be negative when fees exceed the sale price", () => {
    const profit = calculateNetProfit({
      salePrice: 10000,
      fee: 15000,
      shippingFee: 0,
      otherFee: 0,
    });
    expect(profit).toBe(-5000);
  });
});
