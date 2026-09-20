import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Alert } from "@/shared/ui/Alert";
import { Pagination } from "@/shared/ui/Pagination";
import { formatCurrency, formatDate, formatQuantity } from "@/shared/lib/format";
import { safely } from "@/shared/lib/safe";
import { listPurchases } from "@/entities/purchase/api";
import { StockStatusSelect } from "@/features/purchase/update-stock-status/ui";
import { DeletePurchaseControl } from "@/features/purchase/delete-purchase/ui";

export function preload(page: number) {
  void listPurchases(page);
}

export async function PurchaseList({ page }: { page: number }) {
  const result = await safely(() => listPurchases(page));

  if (!result.ok) {
    return (
      <Alert tone="warning" message="매입 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." />
    );
  }

  const { rows: purchases, totalPages } = result.data;

  if (purchases.length === 0) {
    return <EmptyState message="매입 기록이 없습니다." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <Thead>
          <Tr>
            <Th>매입일</Th>
            <Th>상품</Th>
            <Th>수량</Th>
            <Th>잔여</Th>
            <Th>개당 매입가</Th>
            <Th>총 매입금액</Th>
            <Th>매입처</Th>
            <Th>상태</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {purchases.map((purchase) => (
            <Tr key={purchase.id}>
              <Td>{formatDate(purchase.purchase_date)}</Td>
              <Td>
                <Link href={`/products/${purchase.product_id}`} className="hover:underline">
                  {purchase.product?.brand ? `${purchase.product.brand} · ` : ""}
                  {purchase.product?.name ?? "알 수 없음"}
                </Link>
              </Td>
              <Td>{purchase.quantity}</Td>
              <Td>{formatQuantity(purchase.remaining_quantity)}</Td>
              <Td>{formatCurrency(purchase.unit_price)}</Td>
              <Td>{formatCurrency(purchase.quantity * purchase.unit_price)}</Td>
              <Td>{purchase.vendor ?? "-"}</Td>
              <Td>
                {purchase.remaining_quantity > 0 ? (
                  <StockStatusSelect
                    purchaseId={purchase.id}
                    status={purchase.stock_status}
                    remainingQuantity={purchase.remaining_quantity}
                  />
                ) : (
                  <Badge tone="gray">판매 완료</Badge>
                )}
              </Td>
              <Td>
                <DeletePurchaseControl purchaseId={purchase.id} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Pagination page={page} totalPages={totalPages} paramName="purchasePage" />
    </div>
  );
}
