export type PeriodTotals = {
  purchaseAmount: number;
  purchaseQuantity: number;
  saleAmount: number;
  saleQuantity: number;
  netProfit: number;
};

export type YearRange = { minYear: number; maxYear: number };

export type StatsGranularity = "year" | "month" | "day";

export type BreakdownRow = PeriodTotals & {
  key: string;
  label: string;
};

export type DashboardTotals = {
  total_purchase_amount: number;
  total_purchase_quantity: number;
  total_sale_amount: number;
  total_sale_quantity: number;
  total_net_profit: number;
  current_stock_quantity: number;
  current_stock_amount: number;
};
