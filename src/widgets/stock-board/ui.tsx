import Link from "next/link";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Alert } from "@/shared/ui/Alert";
import { safely } from "@/shared/lib/safe";
import { formatQuantity } from "@/shared/lib/format";
import { listStockBoard } from "@/entities/purchase/api";
import { STOCK_STATUS_LABELS, type StockStatus } from "@/entities/purchase/model";
import { GroupedStockStatusSelect } from "@/features/purchase/update-stock-status/ui";

const COLUMNS: StockStatus[] = ["online", "in_transit", "in_hand"];

export async function StockBoard() {
  const result = await safely(() => listStockBoard());

  if (!result.ok) {
    return (
      <Alert
        tone="warning"
        message="재고 현황을 불러오지 못했습니다. Supabase 연결 및 마이그레이션 적용 여부를 확인해 주세요."
      />
    );
  }

  const items = result.data;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {COLUMNS.map((status) => {
        const columnItems = items.filter((item) => item.stock_status === status);
        const totalQuantity = columnItems.reduce(
          (sum, item) => sum + item.remaining_quantity,
          0,
        );

        return (
          <div key={status} className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-title-2 font-bold text-grey-900">
                {STOCK_STATUS_LABELS[status]}
              </h2>
              <Badge tone="gray">{formatQuantity(totalQuantity)}</Badge>
            </div>

            {columnItems.length === 0 ? (
              <EmptyState message="재고가 없습니다." />
            ) : (
              <div className="flex flex-col gap-2">
                {columnItems.map((item) => (
                  <Card
                    key={`${item.product_id}:${item.stock_status}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.product_id}`}
                        className="block truncate text-body-2 font-medium text-grey-900 hover:underline"
                      >
                        {item.brand ? `${item.brand} · ` : ""}
                        {item.product_name}
                      </Link>
                      <p className="text-caption text-grey-500">
                        {[item.size, item.color].filter(Boolean).join(" / ") || "-"} ·{" "}
                        {formatQuantity(item.remaining_quantity)}
                      </p>
                    </div>
                    <GroupedStockStatusSelect
                      productId={item.product_id}
                      status={item.stock_status}
                      remainingQuantity={item.remaining_quantity}
                      batches={item.batches}
                    />
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
