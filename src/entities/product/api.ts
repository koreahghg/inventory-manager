import { cache } from "react";
import { createClient } from "@/shared/lib/supabase/server";
import type { Product, ProductImage, ProductStock } from "./model";

const EMPTY_STOCK = (product_id: string): ProductStock => ({
  product_id,
  purchased_quantity: 0,
  sold_quantity: 0,
  remaining_quantity: 0,
  remaining_cost: 0,
  oldest_available_purchase_date: null,
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
