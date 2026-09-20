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
  it("computes 판매금액 - 매입금액 - 수수료 - 배송비 - 기타비용", () => {
    const profit = calculateNetProfit({
      quantity: 2,
      salePrice: 100000,
      purchaseUnitPrice: 30000,
      fee: 5000,
      shippingFee: 3000,
      otherFee: 1000,
    });
    // 100000 - (2*30000) - 5000 - 3000 - 1000 = 31000
    expect(profit).toBe(31000);
  });

  it("can be negative when sold at a loss", () => {
    const profit = calculateNetProfit({
      quantity: 1,
      salePrice: 10000,
      purchaseUnitPrice: 20000,
      fee: 0,
      shippingFee: 0,
      otherFee: 0,
    });
    expect(profit).toBe(-10000);
  });
});
