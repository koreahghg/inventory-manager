"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import { NEW_PRODUCT_VALUE } from "./constants";

const IMAGE_BUCKET = "product-images";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function num(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export type CreatePurchaseState = {
  error: string | null;
  success: boolean;
  resetToken: string;
};

export async function createPurchase(
  prevState: CreatePurchaseState,
  formData: FormData,
): Promise<CreatePurchaseState> {
  const productId = str(formData, "product_id");
  const purchaseDate = str(formData, "purchase_date");
  const quantity = num(formData, "quantity");
  const unitPrice = num(formData, "unit_price");
  const vendor = str(formData, "vendor");
  const memo = str(formData, "memo");

  const fail = (error: string): CreatePurchaseState => ({
    error,
    success: false,
    resetToken: prevState.resetToken,
  });

  if (!productId) return fail("상품을 선택해 주세요.");
  if (!purchaseDate) return fail("매입일을 입력해 주세요.");
  if (!quantity || quantity <= 0) return fail("수량을 올바르게 입력해 주세요.");
  if (unitPrice === null || unitPrice < 0) return fail("매입가를 올바르게 입력해 주세요.");

  const supabase = await createClient();

  if (productId === NEW_PRODUCT_VALUE) {
    const name = str(formData, "new_name");
    if (!name) return fail("상품명을 입력해 주세요.");

    const { data: newProductId, error: rpcError } = await supabase.rpc(
      "create_product_with_initial_purchase",
      {
        p_name: name,
        p_brand: str(formData, "new_brand"),
        p_style_code: str(formData, "new_style_code"),
        p_size: str(formData, "new_size"),
        p_color: str(formData, "new_color"),
        p_memo: str(formData, "new_memo"),
        p_purchase_date: purchaseDate,
        p_quantity: quantity,
        p_unit_price: unitPrice,
        p_vendor: vendor,
        p_purchase_memo: memo,
      },
    );

    if (rpcError) {
      return fail(`등록에 실패했습니다: ${rpcError.message}`);
    }

    const images = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const uploadedUrls: string[] = [];
    for (const image of images) {
      const extension = image.name.split(".").pop() ?? "jpg";
      const path = `${newProductId}/${randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, image, { contentType: image.type });

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage
          .from(IMAGE_BUCKET)
          .getPublicUrl(path);
        uploadedUrls.push(publicUrl.publicUrl);
      }
    }

    if (uploadedUrls.length > 0) {
      await supabase.from("product_images").insert(
        uploadedUrls.map((url, index) => ({
          product_id: newProductId,
          url,
          is_primary: index === 0,
          sort_order: index,
        })),
      );
    }
  } else {
    const { error } = await supabase.from("purchases").insert({
      product_id: productId,
      purchase_date: purchaseDate,
      quantity,
      unit_price: unitPrice,
      vendor,
      memo,
    });

    if (error) {
      return fail(`등록에 실패했습니다: ${error.message}`);
    }
  }

  revalidatePath("/products");
  revalidatePath("/stats");
  revalidatePath("/");

  return { error: null, success: true, resetToken: randomUUID() };
}
