export type Product = {
  id: string;
  name: string;
  brand: string | null;
  style_code: string | null;
  size: string | null;
  color: string | null;
  memo: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductStock = {
  product_id: string;
  purchased_quantity: number;
  sold_quantity: number;
  remaining_quantity: number;
  remaining_cost: number;
  oldest_available_purchase_date: string | null;
};
