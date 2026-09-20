"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";

export type CancelSaleState = { error: string | null };

export async function cancelSale(
  saleId: string,
  _prevState: CancelSaleState,
  formData: FormData,
): Promise<CancelSaleState> {
  const reasonValue = formData.get("reason");
  const reason =
    typeof reasonValue === "string" && reasonValue.trim() !== ""
      ? reasonValue.trim()
      : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("sales")
    .update({ canceled_at: new Date().toISOString(), cancel_reason: reason })
    .eq("id", saleId)
    .is("canceled_at", null);

  if (error) {
    return { error: `취소 처리에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/products");
  revalidatePath("/stats");
  revalidatePath("/records");
  revalidatePath("/");

  return { error: null };
}
