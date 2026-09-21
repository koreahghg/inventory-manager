"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";

const IMAGE_BUCKET = "product-images";

function extractStoragePath(url: string): string | null {
  const marker = `/${IMAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

async function removeExistingImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
) {
  const { data: product, error } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", productId)
    .maybeSingle();

  if (error) throw error;

  const path = product?.image_url ? extractStoragePath(product.image_url) : null;
  if (path) {
    const { error: removeError } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
    if (removeError) throw removeError;
  }
}

/** 상품 이미지를 등록/교체한다 — 상품당 이미지는 항상 1장만 유지되고,
 * 새로 올리면 기존 이미지는 스토리지에서 삭제된다. */
export async function uploadProductImage(productId: string, formData: FormData) {
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) return;

  const supabase = await createClient();
  await removeExistingImage(supabase, productId);

  const extension = image.name.split(".").pop() ?? "jpg";
  const path = `${productId}/${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, image, { contentType: image.type });

  if (uploadError) throw uploadError;

  const { data: publicUrl } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  const { error: updateError } = await supabase
    .from("products")
    .update({ image_url: publicUrl.publicUrl })
    .eq("id", productId);

  if (updateError) throw updateError;

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
}

export async function deleteProductImage(productId: string) {
  const supabase = await createClient();
  await removeExistingImage(supabase, productId);

  const { error } = await supabase
    .from("products")
    .update({ image_url: null })
    .eq("id", productId);

  if (error) throw error;

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
}
