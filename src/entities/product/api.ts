import { cache } from "react";
import { createClient } from "@/shared/lib/supabase/server";
import type {
  Product,
  ProductImage,
  ProductStock,
  ProductWithStock,
} from "./model";

const EMPTY_STOCK = (product_id: string): ProductStock => ({
  product_id,
  purchased_quantity: 0,
  sold_quantity: 0,
  remaining_quantity: 0,
  remaining_cost: 0,
  oldest_available_purchase_date: null,
});

export type ProductListFilter = {
  q?: string;
  stock?: "all" | "in_stock" | "out_of_stock";
};

export const listProductsWithStock = cache(async function listProductsWithStock(
  filter: ProductListFilter = {},
): Promise<ProductWithStock[]> {
  const supabase = await createClient();

  let productsQuery = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter.q && filter.q.trim() !== "") {
    const term = filter.q.trim().replace(/[%,]/g, "");
    productsQuery = productsQuery.or(
      `name.ilike.%${term}%,brand.ilike.%${term}%,style_code.ilike.%${term}%`,
    );
  }

  const [{ data: products, error: productsError }, { data: stocks }, { data: images }] =
    await Promise.all([
      productsQuery,
      supabase.from("v_product_stock").select("*"),
      supabase
        .from("product_images")
        .select("product_id, url")
        .eq("is_primary", true),
    ]);

  if (productsError) throw productsError;

  const stockByProduct = new Map<string, ProductStock>(
    (stocks ?? []).map((s) => [s.product_id, s as ProductStock]),
  );
  const primaryImageByProduct = new Map<string, string>(
    (images ?? []).map((i) => [i.product_id, i.url as string]),
  );

  const result = (products ?? []).map((product) => ({
    ...(product as Product),
    primary_image_url: primaryImageByProduct.get(product.id) ?? null,
    stock: stockByProduct.get(product.id) ?? EMPTY_STOCK(product.id),
  }));

  if (filter.stock === "in_stock") {
    return result.filter((p) => p.stock.remaining_quantity > 0);
  }
  if (filter.stock === "out_of_stock") {
    return result.filter((p) => p.stock.remaining_quantity <= 0);
  }
  return result;
});

export const getProduct = cache(async function getProduct(
  id: string,
): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Product | null;
});

export const getProductImages = cache(async function getProductImages(
  id: string,
): Promise<ProductImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ProductImage[];
});

export const getProductStock = cache(async function getProductStock(
  id: string,
): Promise<ProductStock> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_product_stock")
    .select("*")
    .eq("product_id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as ProductStock | null) ?? EMPTY_STOCK(id);
});
