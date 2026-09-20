export type TransactionType = "purchase" | "sale";

export type Transaction = {
  id: string;
  type: TransactionType;
  record_date: string;
  product_name: string;
  product_brand: string | null;
  quantity: number;
  unit_amount: number;
  total_amount: number;
  counterparty: string | null;
  canceled_at: string | null;
  memo: string | null;
  net_profit: number;
  created_at: string;
};
