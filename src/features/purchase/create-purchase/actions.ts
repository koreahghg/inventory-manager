"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";

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
  const productName = str(formData, "product_name");
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

  if (!productName) return fail("상품명을 입력해 주세요.");
  if (!purchaseDate) return fail("매입일을 입력해 주세요.");
  if (!quantity || quantity <= 0) return fail("수량을 올바르게 입력해 주세요.");
  if (unitPrice === null || unitPrice < 0) return fail("매입가를 올바르게 입력해 주세요.");

  const supabase = await createClient();

  // 같은 이름의 상품이 이미 있으면 그 상품에 매입만 추가하고, 없으면
  // 상품을 새로 만들면서 최초 매입을 함께 등록한다 (대소문자/공백은
  // 무시하는 완전 일치 비교 — ilike에 와일드카드가 없으면 대소문자만
  // 무시하는 동등 비교로 동작한다).
  const { data: existing, error: lookupError } = await supabase
    .from("products")
    .select("id")
    .ilike("name", productName)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    return fail(`상품 조회에 실패했습니다: ${lookupError.message}`);
  }

  if (existing) {
    const { error } = await supabase.from("purchases").insert({
      product_id: existing.id,
      purchase_date: purchaseDate,
      quantity,
      unit_price: unitPrice,
      vendor,
      memo,
    });

    if (error) {
      return fail(`등록에 실패했습니다: ${error.message}`);
    }
  } else {
    const { error: rpcError } = await supabase.rpc("create_product_with_initial_purchase", {
      p_name: productName,
      p_brand: null,
      p_style_code: null,
      p_size: null,
      p_color: null,
      p_memo: null,
      p_purchase_date: purchaseDate,
      p_quantity: quantity,
      p_unit_price: unitPrice,
      p_vendor: vendor,
      p_purchase_memo: memo,
    });

    if (rpcError) {
      return fail(`등록에 실패했습니다: ${rpcError.message}`);
    }
  }

  revalidatePath("/products");
  revalidatePath("/stats");
  revalidatePath("/");

  return { error: null, success: true, resetToken: randomUUID() };
}
