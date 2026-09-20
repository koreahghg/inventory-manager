"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";

export async function deletePurchase(purchaseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("purchases").delete().eq("id", purchaseId);

  if (error) {
    if (error.code === "23503") {
      throw new Error("판매 기록이 있는 매입은 삭제할 수 없습니다. 먼저 판매를 취소해 주세요.");
    }
    throw error;
  }

  revalidatePath("/products");
  revalidatePath("/stats");
  revalidatePath("/");
}
