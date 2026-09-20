import { cache } from "react";
import { createClient } from "@/shared/lib/supabase/server";
import { calculateNetProfit } from "@/shared/lib/profit";
import type { BreakdownRow, YearRange } from "./model";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

type RawPurchase = { purchase_date: string; quantity: number; unit_price: number };
type RawSale = {
  sale_date: string;
  quantity: number;
  sale_price: number;
  fee: number;
  shipping_fee: number;
  other_fee: number;
};
type RawRegistration = { registered_at: string; fee: number };

const fetchRawTransactions = cache(async function fetchRawTransactions(
  from: string,
  to: string,
): Promise<{ purchases: RawPurchase[]; sales: RawSale[]; registrations: RawRegistration[] }> {
  const supabase = await createClient();
  const [
    { data: purchases, error: purchasesError },
    { data: sales, error: salesError },
    { data: registrations, error: registrationsError },
  ] = await Promise.all([
    supabase
      .from("purchases")
      .select("purchase_date, quantity, unit_price")
      .gte("purchase_date", from)
      .lte("purchase_date", to),
    supabase
      .from("sales")
      .select("sale_date, quantity, sale_price, fee, shipping_fee, other_fee")
      .is("canceled_at", null)
      .gte("sale_date", from)
      .lte("sale_date", to),
    supabase
      .from("logistics_registrations")
      .select("registered_at, fee")
      .gte("registered_at", from)
      .lte("registered_at", to),
  ]);

  if (purchasesError) throw purchasesError;
  if (salesError) throw salesError;
  if (registrationsError) throw registrationsError;

  return {
    purchases: (purchases ?? []) as RawPurchase[],
    sales: (sales ?? []) as unknown as RawSale[],
    registrations: (registrations ?? []) as RawRegistration[],
  };
});

function emptyRow(key: string, label: string): BreakdownRow {
  return {
    key,
    label,
    purchaseAmount: 0,
    purchaseQuantity: 0,
    saleAmount: 0,
    saleQuantity: 0,
    netProfit: 0,
  };
}

function applyTransactions(
  buckets: Map<string, BreakdownRow>,
  purchases: RawPurchase[],
  sales: RawSale[],
  registrations: RawRegistration[],
  keyOf: (date: string) => string,
) {
  for (const p of purchases) {
    const row = buckets.get(keyOf(p.purchase_date));
    if (!row) continue;
    const amount = p.quantity * p.unit_price;
    row.purchaseQuantity += p.quantity;
    row.purchaseAmount += amount;
    // 매입은 매입 시점에 즉시 비용으로 반영한다(현금흐름 기준) — 판매
    // 시점에 매입원가를 또 차감하면 이중 차감이 된다.
    row.netProfit -= amount;
  }

  for (const s of sales) {
    const row = buckets.get(keyOf(s.sale_date));
    if (!row) continue;
    row.saleQuantity += s.quantity;
    row.saleAmount += s.sale_price;
    row.netProfit += calculateNetProfit({
      salePrice: s.sale_price,
      fee: s.fee,
      shippingFee: s.shipping_fee,
      otherFee: s.other_fee,
    });
  }

  // 물류 코드 등록금은 매입 자격을 얻기 위한 비용이라 전체 매입금액에 포함하고,
  // 그만큼 순이익에서도 차감한다.
  for (const r of registrations) {
    const row = buckets.get(keyOf(r.registered_at));
    if (!row) continue;
    row.purchaseAmount += r.fee;
    row.netProfit -= r.fee;
  }
}

export const getYearlyBreakdown = cache(async function getYearlyBreakdown(): Promise<
  BreakdownRow[]
> {
  const range = await getTransactionYearRange();
  const minYear = range?.minYear ?? new Date().getFullYear();
  const maxYear = range?.maxYear ?? new Date().getFullYear();

  const { purchases, sales, registrations } = await fetchRawTransactions(
    `${minYear}-01-01`,
    `${maxYear}-12-31`,
  );

  const buckets = new Map<string, BreakdownRow>();
  for (let year = minYear; year <= maxYear; year++) {
    buckets.set(String(year), emptyRow(String(year), `${year}년`));
  }

  applyTransactions(buckets, purchases, sales, registrations, (date) => date.slice(0, 4));

  return Array.from(buckets.values()).sort((a, b) => b.key.localeCompare(a.key));
});

export const getMonthlyBreakdown = cache(async function getMonthlyBreakdown(
  year: number,
): Promise<BreakdownRow[]> {
  const { purchases, sales, registrations } = await fetchRawTransactions(
    `${year}-01-01`,
    `${year}-12-31`,
  );

  const buckets = new Map<string, BreakdownRow>();
  for (let month = 1; month <= 12; month++) {
    const key = `${year}-${pad(month)}`;
    buckets.set(key, emptyRow(key, `${year}년 ${month}월`));
  }

  applyTransactions(buckets, purchases, sales, registrations, (date) => date.slice(0, 7));

  return Array.from(buckets.values()).sort((a, b) => b.key.localeCompare(a.key));
});

export const getDailyBreakdown = cache(async function getDailyBreakdown(
  year: number,
  month: number,
): Promise<BreakdownRow[]> {
  const lastDay = new Date(year, month, 0).getDate();
  const from = `${year}-${pad(month)}-01`;
  const to = `${year}-${pad(month)}-${pad(lastDay)}`;

  const { purchases, sales, registrations } = await fetchRawTransactions(from, to);

  const buckets = new Map<string, BreakdownRow>();
  for (let day = 1; day <= lastDay; day++) {
    const key = `${year}-${pad(month)}-${pad(day)}`;
    buckets.set(key, emptyRow(key, `${Number(month)}월 ${day}일`));
  }

  applyTransactions(buckets, purchases, sales, registrations, (date) => date);

  return Array.from(buckets.values()).sort((a, b) => b.key.localeCompare(a.key));
});

export const getTransactionYearRange = cache(async function getTransactionYearRange(): Promise<
  YearRange | null
> {
  const supabase = await createClient();
  const [{ data: earliestPurchase }, { data: earliestSale }] = await Promise.all([
    supabase
      .from("purchases")
      .select("purchase_date")
      .order("purchase_date", { ascending: true })
      .limit(1),
    supabase
      .from("sales")
      .select("sale_date")
      .order("sale_date", { ascending: true })
      .limit(1),
  ]);

  const dates = [earliestPurchase?.[0]?.purchase_date, earliestSale?.[0]?.sale_date].filter(
    (d): d is string => Boolean(d),
  );

  const currentYear = new Date().getFullYear();
  if (dates.length === 0) return { minYear: currentYear, maxYear: currentYear };

  const minYear = Math.min(...dates.map((d) => new Date(d).getFullYear()));
  return { minYear, maxYear: Math.max(currentYear, minYear) };
});
