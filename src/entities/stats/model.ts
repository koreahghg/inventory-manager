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
