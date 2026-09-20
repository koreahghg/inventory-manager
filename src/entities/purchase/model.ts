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

/** 재고관리 페이지 표 한 행 — 같은 상품·같은 상태의 매입 배치를 합쳐서
 * 보여준다. 매입처/단가가 배치마다 다를 수 있어 펼치면 batches로 개별
 * 배치를 볼 수 있다(최신순). */
export type StockGroup = {
  product_id: string;
  stock_status: StockStatus;
  product_name: string;
  product_brand: string | null;
  product_image_url: string | null;
  remaining_quantity: number;
  batches: ActivePurchase[];
};

export type AvailablePurchaseBatch = {
  purchase_id: string;
  product_id: string;
  purchase_date: string;
  vendor: string | null;
  unit_price: number;
  remaining_quantity: number;
};

/** 재고 현황 홈 화면 카드 — 같은 상품·같은 상태의 매입 배치를 합쳐서 하나로
 * 보여준다. batches는 오래된 매입분부터(FIFO) 정렬돼 있다. */
export type StockBoardItem = {
  product_id: string;
  product_name: string;
  brand: string | null;
  size: string | null;
  color: string | null;
  stock_status: StockStatus;
  remaining_quantity: number;
  oldest_purchase_date: string;
  batches: { purchase_id: string; remaining_quantity: number; purchase_date: string }[];
};
