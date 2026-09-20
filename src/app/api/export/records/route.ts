import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { toCsv } from "@/shared/lib/csv";
import type { Transaction } from "@/entities/transaction/model";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const typeParam = request.nextUrl.searchParams.get("type");
    const type = typeParam === "purchase" || typeParam === "sale" ? typeParam : null;

    let query = supabase.from("v_transactions").select("*");
    if (type) query = query.eq("type", type);

    const { data, error } = await query
      .order("record_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const header = [
      "구분",
      "날짜",
      "상품명",
      "브랜드",
      "수량",
      "단가",
      "총금액",
      "거래처",
      "순이익",
      "상태",
      "메모",
    ];

    const rows = ((data ?? []) as Transaction[]).map((tx) => [
      tx.type === "purchase" ? "매입" : "판매",
      tx.record_date,
      tx.product_name,
      tx.product_brand ?? "",
      tx.quantity,
      tx.unit_amount,
      tx.total_amount,
      tx.counterparty ?? "",
      tx.net_profit,
      tx.type === "sale" ? (tx.canceled_at ? "취소됨" : "정상") : "-",
      tx.memo ?? "",
    ]);

    return new NextResponse(toCsv([header, ...rows]), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="records.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
