/**
 * 현금흐름 기준 순이익. 매입은 매입 시점에 즉시 비용으로 반영되므로
 * (v_dashboard_totals/stats에서 총매입금액을 차감), 판매 순이익은 매입원가를
 * 다시 차감하지 않는다 — 그러면 같은 비용이 두 번 차감된다.
 * 판매 순이익 = 판매금액 - 수수료 - 배송비 - 기타비용
 */
export function calculateMatchedPurchaseCost(
  quantity: number,
  purchaseUnitPrice: number,
): number {
  return quantity * purchaseUnitPrice;
}

export function calculateNetProfit(params: {
  salePrice: number;
  fee: number;
  shippingFee: number;
  otherFee: number;
}): number {
  return params.salePrice - params.fee - params.shippingFee - params.otherFee;
}
