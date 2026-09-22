import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { toXlsx } from "@/shared/lib/excel";
import { listOnlineStock } from "@/entities/purchase/api";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const items = await listOnlineStock();

    const rows: unknown[][] = [
      ["재고"],
      ...items.map((item) => [
        item.product_brand ? `${item.product_brand} · ${item.product_name}` : item.product_name,
        item.quantity,
      ]),
    ];

    const buffer = await toXlsx("재고", rows);

    return new NextResponse(new Blob([Uint8Array.from(buffer)]), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="stock.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
