import { cache } from "react";
import { createClient } from "@/shared/lib/supabase/server";
import { PAGE_SIZE } from "@/shared/config/pagination";
import { paginate, rangeFor, type Paginated } from "@/shared/lib/pagination";
import type {
  ActivePurchase,
  AvailablePurchaseBatch,
  Purchase,
  StockBoardItem,
  StockGroup,
  StockStatus,
} from "./model";

/** Purchase batches that still have remaining stock, grouped by (product,
 * stock_status) — the 재고관리 page table. 같은 상품·같은 상태의 배치는
 * 한 행으로 합쳐지고, 배치가 여러 개면 펼쳐서 개별 매입처/단가를 볼 수
 * 있다. Full history (sold-out batches included) lives on the 기록 page
 * instead. */
export const listActiveStock = cache(async function listActiveStock(
  page = 1,
  q?: string,
): Promise<Paginated<StockGroup>> {
  const supabase = await createClient();

  let matchingProductIds: string[] | null = null;
  const term = q?.trim().replace(/[%,]/g, "");
  if (term) {
    const { data: matches, error: matchError } = await supabase
      .from("products")
      .select("id")
      .or(`name.ilike.%${term}%,brand.ilike.%${term}%,style_code.ilike.%${term}%`);

    if (matchError) throw matchError;
    matchingProductIds = (matches ?? []).map((m) => m.id);

    if (matchingProductIds.length === 0) {
      return paginate([], page, 0, PAGE_SIZE);
    }
  }

  let query = supabase
    .from("v_purchase_stock")
    .select(
      "purchase_id, product_id, purchase_date, vendor, stock_status, purchased_quantity, remaining_quantity, unit_price",
    )
    .gt("remaining_quantity", 0);

  if (matchingProductIds) {
    query = query.in("product_id", matchingProductIds);
  }

  const { data, error } = await query.order("purchase_date", { ascending: false });

  if (error) throw error;

  const productIds = [...new Set((data ?? []).map((row) => row.product_id))];
  const productById = new Map<string, { name: string; brand: string | null }>();
  const imageByProductId = new Map<string, string>();

  if (productIds.length > 0) {
    const [{ data: products, error: productsError }, { data: images, error: imagesError }] =
      await Promise.all([
        supabase.from("products").select("id, name, brand").in("id", productIds),
        supabase
          .from("product_images")
          .select("product_id, url")
          .eq("is_primary", true)
          .in("product_id", productIds),
      ]);

    if (productsError) throw productsError;
    if (imagesError) throw imagesError;

    for (const product of products ?? []) {
      productById.set(product.id, { name: product.name, brand: product.brand });
    }
    for (const image of images ?? []) {
      imageByProductId.set(image.product_id, image.url);
    }
  }

  const groups = new Map<string, StockGroup>();
  for (const row of data ?? []) {
    const key = `${row.product_id}:${row.stock_status}`;
    const batch: ActivePurchase = {
      ...row,
      stock_status: row.stock_status as StockStatus,
      product_name: productById.get(row.product_id)?.name ?? "알 수 없음",
      product_brand: productById.get(row.product_id)?.brand ?? null,
      product_image_url: imageByProductId.get(row.product_id) ?? null,
    };

    const existing = groups.get(key);
    if (existing) {
      existing.remaining_quantity += row.remaining_quantity;
      existing.batches.push(batch);
      continue;
    }

    groups.set(key, {
      product_id: row.product_id,
      stock_status: batch.stock_status,
      product_name: batch.product_name,
      product_brand: batch.product_brand,
      product_image_url: batch.product_image_url,
      remaining_quantity: row.remaining_quantity,
      batches: [batch],
    });
  }

  // 그룹 안 batches는 이미 최신순(fetch 순서)으로 쌓였다. 그룹 자체도
  // 가장 최근 매입일(batches[0]) 기준 최신순으로 정렬한다.
  const allGroups = Array.from(groups.values()).sort((a, b) =>
    (b.batches[0]?.purchase_date ?? "").localeCompare(a.batches[0]?.purchase_date ?? ""),
  );

  const [from, to] = rangeFor(page, PAGE_SIZE);
  const pageRows = allGroups.slice(from, to + 1);

  return paginate(pageRows, page, allGroups.length, PAGE_SIZE);
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

/** Every batch with remaining stock, grouped by (product, stock_status) on
 * the home board — 여러 매입 배치가 같은 상품·같은 상태에 있으면 카드
 * 하나로 합쳐서 보여준다. batches는 FIFO(오래된 매입분부터) 순으로 담는다. */
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
        .order("purchase_date", { ascending: true }),
      supabase.from("products").select("id, name, brand, size, color"),
    ]);

  if (stockError) throw stockError;
  if (productsError) throw productsError;

  type ProductRow = { id: string; name: string; brand: string | null; size: string | null; color: string | null };
  const productById = new Map((products ?? []).map((p) => [p.id, p as ProductRow]));

  const groups = new Map<string, StockBoardItem>();
  for (const row of stockRows ?? []) {
    const key = `${row.product_id}:${row.stock_status}`;
    const batch = {
      purchase_id: row.purchase_id,
      remaining_quantity: row.remaining_quantity,
      purchase_date: row.purchase_date,
    };

    const existing = groups.get(key);
    if (existing) {
      existing.remaining_quantity += row.remaining_quantity;
      existing.batches.push(batch);
      continue;
    }

    const product = productById.get(row.product_id);
    groups.set(key, {
      product_id: row.product_id,
      product_name: product?.name ?? "알 수 없음",
      brand: product?.brand ?? null,
      size: product?.size ?? null,
      color: product?.color ?? null,
      stock_status: row.stock_status as StockStatus,
      remaining_quantity: row.remaining_quantity,
      oldest_purchase_date: row.purchase_date,
      batches: [batch],
    });
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.oldest_purchase_date < b.oldest_purchase_date ? 1 : -1,
  );
});
