"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import type { StockStatus } from "@/entities/purchase/model";

/** 재고관리/재고 현황에서 (합쳐진 행 포함) 상태를 옮긴다 — 주어진 배치들
 * 에서만 소비한다. 요청 수량이 배치 하나의 남은 수량과 같으면 분리 없이
 * 그 배치의 상태만 바뀌고, 모자라면 다음 배치로 넘어가며 필요한 만큼
 * 채운다. */
export async function moveStockStatusForBatches(
  batches: { purchaseId: string; remainingQuantity: number }[],
  quantity: number,
  toStatus: StockStatus,
) {
  const supabase = await createClient();
  let left = quantity;

  for (const batch of batches) {
    if (left <= 0) break;
    const take = Math.min(left, batch.remainingQuantity);
    if (take <= 0) continue;

    const { error } = await supabase.rpc("split_purchase_stock_status", {
      p_purchase_id: batch.purchaseId,
      p_quantity: take,
      p_new_status: toStatus,
    });

    if (error) throw error;
    left -= take;
  }

  if (left > 0) {
    throw new Error("exceeds remaining stock");
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/records");
}
