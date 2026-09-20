/**
 * 순이익 = 판매금액 - 매입금액 - 수수료 - 배송비 - 기타 비용 (README §6)
 */
export function calculateMatchedPurchaseCost(
  quantity: number,
  purchaseUnitPrice: number,
): number {
  return quantity * purchaseUnitPrice;
}

export function calculateNetProfit(params: {
  quantity: number;
  salePrice: number;
  purchaseUnitPrice: number;
  fee: number;
  shippingFee: number;
  otherFee: number;
}): number {
  const cost = calculateMatchedPurchaseCost(params.quantity, params.purchaseUnitPrice);
  return params.salePrice - cost - params.fee - params.shippingFee - params.otherFee;
}
