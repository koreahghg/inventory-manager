import { cache } from "react";
import { createClient } from "@/shared/lib/supabase/server";
import { PAGE_SIZE } from "@/shared/config/pagination";
import { paginate, rangeFor, type Paginated } from "@/shared/lib/pagination";
import type { Transaction, TransactionType } from "./model";

export const listTransactions = cache(async function listTransactions(
  page = 1,
  type?: TransactionType,
): Promise<Paginated<Transaction>> {
  const supabase = await createClient();
  const [from, to] = rangeFor(page, PAGE_SIZE);
  // 취소된 판매는 재고로 돌아간 것이므로 기록에서도 뺀다 (매입은 canceled_at이
  // 항상 null이라 이 필터에 영향받지 않는다).
  let query = supabase.from("v_transactions").select("*", { count: "exact" }).is("canceled_at", null);
  if (type) query = query.eq("type", type);

  const { data, error, count } = await query
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return paginate((data ?? []) as Transaction[], page, count ?? 0, PAGE_SIZE);
});
