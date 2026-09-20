"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export type UpdateProductState = { error: string | null };

export async function updateProduct(
  productId: string,
  _prevState: UpdateProductState,
  formData: FormData,
): Promise<UpdateProductState> {
  const name = str(formData, "name");
  if (!name) return { error: "상품명을 입력해 주세요." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      brand: str(formData, "brand"),
      style_code: str(formData, "style_code"),
      size: str(formData, "size"),
      color: str(formData, "color"),
      memo: str(formData, "memo"),
    })
    .eq("id", productId);

  if (error) {
    return { error: `수정에 실패했습니다: ${error.message}` };
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
  redirect(`/products/${productId}`);
}
