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
