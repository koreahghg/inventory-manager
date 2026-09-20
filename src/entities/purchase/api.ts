import { cache } from "react";
import { createClient } from "@/shared/lib/supabase/server";
import { PAGE_SIZE } from "@/shared/config/pagination";
import { paginate, rangeFor, type Paginated } from "@/shared/lib/pagination";
import type {
  AvailablePurchaseBatch,
  Purchase,
  PurchaseWithProduct,
  StockBoardItem,
  StockStatus,
} from "./model";

export const listPurchases = cache(async function listPurchases(
  page = 1,
): Promise<Paginated<PurchaseWithProduct>> {
  const supabase = await createClient();
  const [from, to] = rangeFor(page, PAGE_SIZE);
  const [{ data, error, count }, { data: stockRows, error: stockError }] = await Promise.all([
    supabase
      .from("purchases")
      .select("*, product:products(name, brand, style_code, size, color)", {
        count: "exact",
      })
      .order("purchase_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase.from("v_purchase_stock").select("purchase_id, remaining_quantity"),
  ]);

  if (error) throw error;
  if (stockError) throw stockError;

  const remainingByPurchaseId = new Map(
    (stockRows ?? []).map((row) => [row.purchase_id, row.remaining_quantity as number]),
  );

  const rows = ((data ?? []) as unknown as Omit<PurchaseWithProduct, "remaining_quantity">[]).map(
    (row) => ({
      ...row,
      remaining_quantity: remainingByPurchaseId.get(row.id) ?? 0,
    }),
  );

  return paginate(rows, page, count ?? 0, PAGE_SIZE);
});

export const listPurchasesByProduct = cache(async function listPurchasesByProduct(
  productId: string,
): Promise<Purchase[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("product_id", productId)
    .order("purchase_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Purchase[];
});

/** Purchase batches with remaining stock, oldest first (FIFO). */
export const listAvailablePurchaseBatches = cache(
  async function listAvailablePurchaseBatches(
    productId: string,
  ): Promise<AvailablePurchaseBatch[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("v_purchase_stock")
      .select("purchase_id, product_id, purchase_date, vendor, unit_price, remaining_quantity")
      .eq("product_id", productId)
      .gt("remaining_quantity", 0)
      .order("purchase_date", { ascending: true });

    if (error) throw error;
    return (data ?? []) as AvailablePurchaseBatch[];
  },
);

/** All batches with remaining stock across every product, oldest first (FIFO). */
export const listAllAvailablePurchaseBatches = cache(
  async function listAllAvailablePurchaseBatches(): Promise<AvailablePurchaseBatch[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("v_purchase_stock")
      .select("purchase_id, product_id, purchase_date, vendor, unit_price, remaining_quantity")
      .gt("remaining_quantity", 0)
      .order("purchase_date", { ascending: true });

    if (error) throw error;
    return (data ?? []) as AvailablePurchaseBatch[];
  },
);

/** Every batch with remaining stock, grouped by stock_status on the home board. */
export const listStockBoard = cache(async function listStockBoard(): Promise<
  StockBoardItem[]
> {
  const supabase = await createClient();

  const [{ data: stockRows, error: stockError }, { data: products, error: productsError }] =
    await Promise.all([
      supabase
        .from("v_purchase_stock")
        .select("purchase_id, product_id, purchase_date, stock_status, remaining_quantity")
        .gt("remaining_quantity", 0)
        .order("purchase_date", { ascending: false }),
      supabase.from("products").select("id, name, brand, size, color"),
    ]);

  if (stockError) throw stockError;
  if (productsError) throw productsError;

  type ProductRow = { id: string; name: string; brand: string | null; size: string | null; color: string | null };
  const productById = new Map((products ?? []).map((p) => [p.id, p as ProductRow]));

  return (stockRows ?? []).map((row) => {
    const product = productById.get(row.product_id);
    return {
      purchase_id: row.purchase_id,
      product_id: row.product_id,
      product_name: product?.name ?? "알 수 없음",
      brand: product?.brand ?? null,
      size: product?.size ?? null,
      color: product?.color ?? null,
      purchase_date: row.purchase_date,
      remaining_quantity: row.remaining_quantity,
      stock_status: row.stock_status as StockStatus,
    };
  });
});
