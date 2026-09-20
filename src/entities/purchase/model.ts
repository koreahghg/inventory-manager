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

/** A purchase batch that still has remaining stock — the actionable subset
 * shown on the 재고관리 page (전체 이력은 기록 페이지에서 확인). */
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

export type AvailablePurchaseBatch = {
  purchase_id: string;
  product_id: string;
  purchase_date: string;
  vendor: string | null;
  unit_price: number;
  remaining_quantity: number;
};

export type StockBoardItem = {
  purchase_id: string;
  product_id: string;
  product_name: string;
  brand: string | null;
  size: string | null;
  color: string | null;
  purchase_date: string;
  remaining_quantity: number;
  stock_status: StockStatus;
};
