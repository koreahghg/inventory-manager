"use server";

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

export type CreateSaleState = {
  error: string | null;
  success: boolean;
  resetToken: string;
};

export async function createSale(
  prevState: CreateSaleState,
  formData: FormData,
): Promise<CreateSaleState> {
  const purchaseId = str(formData, "purchase_id");
  const saleDate = str(formData, "sale_date");
  const quantity = num(formData, "quantity") ?? 1;
  const salePrice = num(formData, "sale_price");

  const fail = (error: string): CreateSaleState => ({
    error,
    success: false,
    resetToken: prevState.resetToken,
  });

  if (!purchaseId) return fail("매입 배치를 선택해 주세요.");
  if (!saleDate) return fail("판매일을 입력해 주세요.");
  if (quantity <= 0) return fail("수량을 올바르게 입력해 주세요.");
  if (salePrice === null || salePrice < 0) return fail("판매가격을 올바르게 입력해 주세요.");

  const supabase = await createClient();
  const { error } = await supabase.from("sales").insert({
    purchase_id: purchaseId,
    sale_date: saleDate,
    quantity,
    sale_price: salePrice,
    platform: str(formData, "platform"),
    fee: num(formData, "fee") ?? 0,
    shipping_fee: num(formData, "shipping_fee") ?? 0,
    other_fee: num(formData, "other_fee") ?? 0,
    memo: str(formData, "memo"),
  });

  if (error) {
    const message = error.message.includes("exceeds remaining stock")
      ? "선택한 매입 배치의 남은 재고보다 많은 수량입니다."
      : `등록에 실패했습니다: ${error.message}`;
    return fail(message);
  }

  revalidatePath("/products");
  revalidatePath("/stats");
  revalidatePath("/records");
  revalidatePath("/");

  return { error: null, success: true, resetToken: crypto.randomUUID() };
}
