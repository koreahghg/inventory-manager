export type StockStatus = "online" | "in_transit" | "in_hand";

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  online: "온라인 재고",
  in_transit: "배송중 재고",
  in_hand: "보유 재고",
};

export type Purchase = {
  id: string;
  product_id: string;
  purchase_date: string;
  quantity: number;
  unit_price: number;
  vendor: string | null;
  memo: string | null;
  stock_status: StockStatus;
  created_at: string;
};

/** A purchase batch that still has remaining stock — used for the 재고 현황
 * 홈 화면 표 (배치 하나하나를 각자 행으로 보여줌). */
export type ActivePurchase = {
  purchase_id: string;
  product_id: string;
  product_name: string;
  product_brand: string | null;
  product_image_url: string | null;
  purchase_date: string;
  vendor: string | null;
  stock_status: StockStatus;
  purchased_quantity: number;
  remaining_quantity: number;
  unit_price: number;
};

/** 재고관리 페이지 표 한 행 — 같은 상품·같은 상태·같은 매입일·같은
 * 단가·같은 매입처인 매입 배치를 하나로 합쳐서 보여준다(재고 상태를
 * 옮기면서 원래 하나였던 매입이 여러 행으로 쪼개진 경우를 다시 하나처럼
 * 보여줌). batches는 실제 조작(이동/판매/삭제) 대상이 되는 원본 배치들 —
 * 부분적으로 판매된 배치가 섞여 있을 수 있어 배치별 잔여 수량을 따로 담는다. */
export type StockGroup = {
  batches: { purchase_id: string; remaining_quantity: number }[];
  product_id: string;
  product_name: string;
  product_brand: string | null;
  product_image_url: string | null;
  purchase_date: string;
  vendor: string | null;
  stock_status: StockStatus;
  purchased_quantity: number;
  remaining_quantity: number;
  unit_price: number;
};

export type AvailablePurchaseBatch = {
  purchase_id: string;
  product_id: string;
  purchase_date: string;
  vendor: string | null;
  unit_price: number;
  remaining_quantity: number;
};
