export type Sale = {
  id: string;
  purchase_id: string;
  sale_date: string;
  quantity: number;
  sale_price: number;
  platform: string | null;
  fee: number;
  shipping_fee: number;
  other_fee: number;
  memo: string | null;
  canceled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
};

export type SaleWithDetail = Sale & {
  product_id: string;
  product_name: string;
  purchase_unit_price: number;
  matched_purchase_cost: number;
  net_profit: number;
};
