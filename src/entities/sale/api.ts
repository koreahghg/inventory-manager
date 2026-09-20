import { cache } from "react";
import { createClient } from "@/shared/lib/supabase/server";
import { calculateMatchedPurchaseCost, calculateNetProfit } from "@/shared/lib/profit";
import { PAGE_SIZE } from "@/shared/config/pagination";
import { paginate, rangeFor, type Paginated } from "@/shared/lib/pagination";
import type { Sale, SaleWithDetail } from "./model";

type SaleRow = Sale & {
  purchases: {
    unit_price: number;
    product_id: string;
    products: { name: string } | null;
  } | null;
};

function toSaleWithDetail(row: SaleRow): SaleWithDetail {
  const unitPrice = row.purchases?.unit_price ?? 0;

  return {
    ...row,
    product_id: row.purchases?.product_id ?? "",
    product_name: row.purchases?.products?.name ?? "알 수 없음",
    purchase_unit_price: unitPrice,
    matched_purchase_cost: calculateMatchedPurchaseCost(row.quantity, unitPrice),
    net_profit: calculateNetProfit({
      quantity: row.quantity,
      salePrice: row.sale_price,
      purchaseUnitPrice: unitPrice,
      fee: row.fee,
      shippingFee: row.shipping_fee,
      otherFee: row.other_fee,
    }),
  };
}

const SALE_SELECT = "*, purchases(unit_price, product_id, products(name))";

export const listSales = cache(async function listSales(
  page = 1,
): Promise<Paginated<SaleWithDetail>> {
  const supabase = await createClient();
  const [from, to] = rangeFor(page, PAGE_SIZE);
  const { data, error, count } = await supabase
    .from("sales")
    .select(SALE_SELECT, { count: "exact" })
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return paginate(
    ((data ?? []) as unknown as SaleRow[]).map(toSaleWithDetail),
    page,
    count ?? 0,
    PAGE_SIZE,
  );
});

export const listSalesByProduct = cache(async function listSalesByProduct(
  productId: string,
): Promise<SaleWithDetail[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select(`*, purchases!inner(unit_price, product_id, products(name))`)
    .eq("purchases.product_id", productId)
    .order("sale_date", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as SaleRow[]).map(toSaleWithDetail);
});

export const getSale = cache(async function getSale(
  id: string,
): Promise<SaleWithDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select(SALE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? toSaleWithDetail(data as unknown as SaleRow) : null;
});
