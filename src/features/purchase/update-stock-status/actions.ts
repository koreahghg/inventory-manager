"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import type { StockStatus } from "@/entities/purchase/model";

export async function updateStockStatus(purchaseId: string, status: StockStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("purchases")
    .update({ stock_status: status })
    .eq("id", purchaseId);

  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/products");
}

/** 남은 수량 중 일부만 다른 상태로 옮긴다 (나머지는 원래 배치에 그대로
 * 남는다). RPC가 내부에서 수량 분리를 처리한다. */
export async function splitStockStatus(purchaseId: string, quantity: number, status: StockStatus) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("split_purchase_stock_status", {
    p_purchase_id: purchaseId,
    p_quantity: quantity,
    p_new_status: status,
  });

  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/records");
}

/** 재고 현황 홈 화면의 (상품, 상태) 합산 카드에서 상태를 옮긴다 — 여러
 * 매입 배치에 걸쳐 있을 수 있어 오래된 배치부터(FIFO) 필요한 만큼 소비한다. */
export async function moveStockStatus(
  productId: string,
  fromStatus: StockStatus,
  quantity: number,
  toStatus: StockStatus,
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("move_stock_status", {
    p_product_id: productId,
    p_from_status: fromStatus,
    p_quantity: quantity,
    p_to_status: toStatus,
  });

  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/records");
}
