import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { toCsv } from "@/shared/lib/csv";

type Row = {
  purchase_date: string;
  quantity: number;
  unit_price: number;
  vendor: string | null;
  memo: string | null;
  products: { name: string; brand: string | null; style_code: string | null } | null;
};

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("purchases")
      .select("purchase_date, quantity, unit_price, vendor, memo, products(name, brand, style_code)")
      .order("purchase_date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const header = [
      "매입일",
      "상품명",
      "브랜드",
      "품번",
      "수량",
      "개당매입가",
      "총매입금액",
      "매입처",
      "메모",
    ];

    const rows = ((data ?? []) as unknown as Row[]).map((p) => [
      p.purchase_date,
      p.products?.name ?? "",
      p.products?.brand ?? "",
      p.products?.style_code ?? "",
      p.quantity,
      p.unit_price,
      p.quantity * p.unit_price,
      p.vendor ?? "",
      p.memo ?? "",
    ]);

    return new NextResponse(toCsv([header, ...rows]), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="purchases.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
