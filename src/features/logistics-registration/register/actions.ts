"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";

export type RegisterLogisticsState = { error: string | null; success: boolean };

export async function registerLogistics(
  _prevState: RegisterLogisticsState,
  formData: FormData,
): Promise<RegisterLogisticsState> {
  const registeredAt = formData.get("registered_at");
  const feeRaw = formData.get("fee");
  const memoRaw = formData.get("memo");

  if (typeof registeredAt !== "string" || registeredAt.trim() === "") {
    return { error: "등록일을 입력해 주세요.", success: false };
  }

  const fee = Number(feeRaw);
  if (!Number.isFinite(fee) || fee < 0) {
    return { error: "등록금을 올바르게 입력해 주세요.", success: false };
  }

  const memo = typeof memoRaw === "string" && memoRaw.trim() !== "" ? memoRaw.trim() : null;

  const supabase = await createClient();
  const { error } = await supabase.from("logistics_registrations").insert({
    registered_at: registeredAt,
    fee,
    memo,
  });

  if (error) {
    return { error: `등록에 실패했습니다: ${error.message}`, success: false };
  }

  revalidatePath("/products");
  revalidatePath("/stats");

  return { error: null, success: true };
}
