"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";

export async function updateProductMemo(productId: string, memo: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ memo: memo.trim() || null })
    .eq("id", productId);

  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}
