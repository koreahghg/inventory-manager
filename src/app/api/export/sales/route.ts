import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { toCsv } from "@/shared/lib/csv";
import { calculateNetProfit } from "@/shared/lib/profit";

type Row = {
  sale_date: string;
  quantity: number;
  sale_price: number;
  platform: string | null;
  fee: number;
  shipping_fee: number;
  other_fee: number;
  memo: string | null;
  canceled_at: string | null;
  cancel_reason: string | null;
  purchases: {
    unit_price: number;
    products: { name: string; brand: string | null; style_code: string | null } | null;
  } | null;
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
      .from("sales")
      .select(
        "sale_date, quantity, sale_price, platform, fee, shipping_fee, other_fee, memo, canceled_at, cancel_reason, purchases(unit_price, products(name, brand, style_code))",
      )
      .order("sale_date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const header = [
      "판매일",
      "상품명",
      "브랜드",
      "품번",
      "수량",
      "판매가격",
      "매입원가",
      "수수료",
      "배송비",
      "기타비용",
      "순이익",
      "플랫폼",
      "상태",
      "취소사유",
      "메모",
    ];

    const rows = ((data ?? []) as unknown as Row[]).map((s) => {
      const unitPrice = s.purchases?.unit_price ?? 0;
      const cost = s.quantity * unitPrice;
      const netProfit = calculateNetProfit({
        quantity: s.quantity,
        salePrice: s.sale_price,
        purchaseUnitPrice: unitPrice,
        fee: s.fee,
        shippingFee: s.shipping_fee,
        otherFee: s.other_fee,
      });

      return [
        s.sale_date,
        s.purchases?.products?.name ?? "",
        s.purchases?.products?.brand ?? "",
        s.purchases?.products?.style_code ?? "",
        s.quantity,
        s.sale_price,
        cost,
        s.fee,
        s.shipping_fee,
        s.other_fee,
        netProfit,
        s.platform ?? "",
        s.canceled_at ? "취소됨" : "정상",
        s.cancel_reason ?? "",
        s.memo ?? "",
      ];
    });

    return new NextResponse(toCsv([header, ...rows]), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="sales.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
