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

export async function deleteProductImage(productId: string, imageId: string) {
  const supabase = await createClient();

  const { data: image } = await supabase
    .from("product_images")
    .select("url, is_primary")
    .eq("id", imageId)
    .maybeSingle();

  if (!image) return;

  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) return;

  const path = extractStoragePath(image.url);
  if (path) {
    await supabase.storage.from(IMAGE_BUCKET).remove([path]);
  }

  if (image.is_primary) {
    const { data: next } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (next) {
      await supabase.from("product_images").update({ is_primary: true }).eq("id", next.id);
    }
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
}

export async function uploadProductImages(productId: string, formData: FormData) {
  const images = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (images.length === 0) return;

  const supabase = await createClient();

  const { count: existingCount } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  const baseSortOrder = existingCount ?? 0;
  const hasExisting = baseSortOrder > 0;

  const uploadedUrls: string[] = [];
  for (const image of images) {
    const extension = image.name.split(".").pop() ?? "jpg";
    const path = `${productId}/${randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, image, { contentType: image.type });

    if (!uploadError) {
      const { data: publicUrl } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
      uploadedUrls.push(publicUrl.publicUrl);
    }
  }

  if (uploadedUrls.length > 0) {
    await supabase.from("product_images").insert(
      uploadedUrls.map((url, index) => ({
        product_id: productId,
        url,
        is_primary: !hasExisting && index === 0,
        sort_order: baseSortOrder + index,
      })),
    );
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
}

export async function setPrimaryImage(productId: string, imageId: string) {
  const supabase = await createClient();
  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);
  await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
}
