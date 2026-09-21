import { Table, Thead, Tbody, Tr, Th, Td } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Alert } from "@/shared/ui/Alert";
import { safely } from "@/shared/lib/safe";
import { formatQuantity } from "@/shared/lib/format";
import { listStockBoard } from "@/entities/purchase/api";
import { STOCK_STATUS_LABELS, type StockStatus } from "@/entities/purchase/model";
import { CycleStockStatusControl } from "@/features/purchase/update-stock-status/ui";
import { ProductMemoButton } from "@/features/product/update-memo/ui";

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

        // 매입 수량이 여러 개면 한 줄로 합쳐 보여주지 않고, 낱개로 각각
        // 한 줄씩 보여준다 — 각 줄의 이동/판매는 그 배치에서 1개만 처리한다.
        const unitRows = columnItems.flatMap((item) =>
          Array.from({ length: item.remaining_quantity }, (_, i) => ({
            key: `${item.purchase_id}-${i}`,
            item,
          })),
        );

        return (
          <div key={status} className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-title-2 font-bold text-grey-900">
                {STOCK_STATUS_LABELS[status]}
              </h2>
              <Badge tone="gray">{formatQuantity(totalQuantity)}</Badge>
            </div>

            {unitRows.length === 0 ? (
              <EmptyState message="재고가 없습니다." />
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>상품명</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {unitRows.map(({ key, item }) => (
                    <Tr key={key}>
                      <Td>
                        <ProductMemoButton
                          productId={item.product_id}
                          productName={
                            (item.product_brand ? `${item.product_brand} · ` : "") +
                            item.product_name
                          }
                          memo={item.product_memo}
                          className="hover:underline"
                        />
                      </Td>
                      <Td>
                        <CycleStockStatusControl
                          status={item.stock_status}
                          remainingQuantity={1}
                          batches={[{ purchase_id: item.purchase_id, remaining_quantity: 1 }]}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </div>
        );
      })}
    </div>
  );
}
