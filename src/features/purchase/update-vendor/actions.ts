"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";

export async function updateVendor(productId: string, purchaseId: string, vendor: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("purchases")
    .update({ vendor: vendor.trim() || null })
    .eq("id", purchaseId);

  if (error) throw error;

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
  revalidatePath("/records");
}
