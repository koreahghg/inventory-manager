import { cache } from "react";
import { createClient } from "@/shared/lib/supabase/server";
import { PAGE_SIZE } from "@/shared/config/pagination";
import { paginate, rangeFor, type Paginated } from "@/shared/lib/pagination";
import type {
  ActivePurchase,
  AvailablePurchaseBatch,
  OnlineStockItem,
  Purchase,
  StockGroup,
  StockStatus,
} from "./model";

/** Purchase batches that still have remaining stock, merged by (product,
 * stock_status, purchase_date, unit_price, vendor) — the 재고관리 page
 * table. 재고 상태를 옮기면서 원래 하나였던 매입이 여러 행으로 쪼개진
 * 경우, 조건이 모두 같으면 다시 하나의 행으로 합쳐서 보여준다 (조건이
 * 하나라도 다르면 별도 행). Full history (sold-out batches included)
 * lives on the 기록 page instead. */
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
  const productById = new Map<
    string,
    { name: string; brand: string | null; image_url: string | null }
  >();

  if (productIds.length > 0) {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, brand, image_url")
      .in("id", productIds);

    if (productsError) throw productsError;

    for (const product of products ?? []) {
      productById.set(product.id, {
        name: product.name,
        brand: product.brand,
        image_url: product.image_url,
      });
    }
  }

  const groups = new Map<string, StockGroup>();
  for (const row of data ?? []) {
    const key = `${row.product_id}:${row.stock_status}:${row.purchase_date}:${row.unit_price}:${row.vendor ?? ""}`;

    const existing = groups.get(key);
    if (existing) {
      existing.purchased_quantity += row.purchased_quantity;
      existing.remaining_quantity += row.remaining_quantity;
      existing.batches.push({
        purchase_id: row.purchase_id,
        remaining_quantity: row.remaining_quantity,
      });
      continue;
    }

    groups.set(key, {
      batches: [{ purchase_id: row.purchase_id, remaining_quantity: row.remaining_quantity }],
      product_id: row.product_id,
      product_name: productById.get(row.product_id)?.name ?? "알 수 없음",
      product_brand: productById.get(row.product_id)?.brand ?? null,
      product_image_url: productById.get(row.product_id)?.image_url ?? null,
      purchase_date: row.purchase_date,
      vendor: row.vendor,
      stock_status: row.stock_status as StockStatus,
      purchased_quantity: row.purchased_quantity,
      remaining_quantity: row.remaining_quantity,
      unit_price: row.unit_price,
    });
  }

  const allGroups = Array.from(groups.values()).sort((a, b) =>
    b.purchase_date.localeCompare(a.purchase_date),
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

/** Every batch with remaining stock, for the 재고 현황 홈 화면 표 — 배치
 * 하나하나를 각자 행으로 보여준다 (재고관리 페이지와 달리 합치지 않음). */
export const listStockBoard = cache(async function listStockBoard(): Promise<
  ActivePurchase[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_purchase_stock")
    .select(
      "purchase_id, product_id, purchase_date, vendor, stock_status, purchased_quantity, remaining_quantity, unit_price",
    )
    .gt("remaining_quantity", 0)
    .order("purchase_date", { ascending: false });

  if (error) throw error;

  const productIds = [...new Set((data ?? []).map((row) => row.product_id))];
  const productById = new Map<
    string,
    { name: string; brand: string | null; image_url: string | null; memo: string | null }
  >();

  if (productIds.length > 0) {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, brand, image_url, memo")
      .in("id", productIds);

    if (productsError) throw productsError;

    for (const product of products ?? []) {
      productById.set(product.id, {
        name: product.name,
        brand: product.brand,
        image_url: product.image_url,
        memo: product.memo,
      });
    }
  }

  return (data ?? []).map((row) => ({
    ...row,
    stock_status: row.stock_status as StockStatus,
    product_name: productById.get(row.product_id)?.name ?? "알 수 없음",
    product_brand: productById.get(row.product_id)?.brand ?? null,
    product_image_url: productById.get(row.product_id)?.image_url ?? null,
    product_memo: productById.get(row.product_id)?.memo ?? null,
  }));
});

/** 온라인 재고 엑셀 내보내기용 — 상품별로 잔여 수량을 합산한 한 줄씩,
 * 매입 배치(매입일·단가·매입처)는 구분하지 않는다. */
export const listOnlineStock = cache(async function listOnlineStock(): Promise<
  OnlineStockItem[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_purchase_stock")
    .select("product_id, remaining_quantity")
    .eq("stock_status", "online")
    .gt("remaining_quantity", 0);

  if (error) throw error;

  const quantityByProduct = new Map<string, number>();
  for (const row of data ?? []) {
    quantityByProduct.set(
      row.product_id,
      (quantityByProduct.get(row.product_id) ?? 0) + row.remaining_quantity,
    );
  }

  const productIds = [...quantityByProduct.keys()];
  const productById = new Map<string, { name: string; brand: string | null }>();

  if (productIds.length > 0) {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, brand")
      .in("id", productIds);

    if (productsError) throw productsError;

    for (const product of products ?? []) {
      productById.set(product.id, { name: product.name, brand: product.brand });
    }
  }

  return productIds
    .map((productId) => ({
      product_id: productId,
      product_name: productById.get(productId)?.name ?? "알 수 없음",
      product_brand: productById.get(productId)?.brand ?? null,
      quantity: quantityByProduct.get(productId)!,
    }))
    .sort((a, b) => a.product_name.localeCompare(b.product_name, "ko"));
});
