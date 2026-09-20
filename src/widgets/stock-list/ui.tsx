import Image from "next/image";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/shared/ui/Table";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Alert } from "@/shared/ui/Alert";
import { Pagination } from "@/shared/ui/Pagination";
import { formatCurrency, formatDate, formatQuantity } from "@/shared/lib/format";
import { safely } from "@/shared/lib/safe";
import { listActivePurchases } from "@/entities/purchase/api";
import { StockStatusSelect } from "@/features/purchase/update-stock-status/ui";
import { DeletePurchaseControl } from "@/features/purchase/delete-purchase/ui";

export function preload(page: number, q?: string) {
  void listActivePurchases(page, q);
}

export async function StockList({ page, q }: { page: number; q?: string }) {
  const result = await safely(() => listActivePurchases(page, q));

  if (!result.ok) {
    return (
      <Alert tone="warning" message="재고 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." />
    );
  }

  const { rows: purchases, totalPages } = result.data;

  if (purchases.length === 0) {
    return <EmptyState message="조건에 맞는 재고가 없습니다." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <Thead>
          <Tr>
            <Th>이미지</Th>
            <Th>상품명</Th>
            <Th>매입일</Th>
            <Th>잔여 수량</Th>
            <Th>개당 매입가</Th>
            <Th>매입처</Th>
            <Th>상태</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {purchases.map((purchase) => (
            <Tr key={purchase.purchase_id}>
              <Td>
                <Link href={`/products/${purchase.product_id}`}>
                  {purchase.product_image_url ? (
                    <Image
                      src={purchase.product_image_url}
                      alt={purchase.product_name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-m bg-grey-100" />
                  )}
                </Link>
              </Td>
              <Td>
                <Link href={`/products/${purchase.product_id}`} className="hover:underline">
                  {purchase.product_brand ? `${purchase.product_brand} · ` : ""}
                  {purchase.product_name}
                </Link>
              </Td>
              <Td>{formatDate(purchase.purchase_date)}</Td>
              <Td>
                {formatQuantity(purchase.remaining_quantity)}
                {purchase.remaining_quantity !== purchase.purchased_quantity
                  ? ` / ${formatQuantity(purchase.purchased_quantity)}`
                  : ""}
              </Td>
              <Td>{formatCurrency(purchase.unit_price)}</Td>
              <Td>{purchase.vendor ?? "-"}</Td>
              <Td>
                <StockStatusSelect
                  purchaseId={purchase.purchase_id}
                  status={purchase.stock_status}
                  remainingQuantity={purchase.remaining_quantity}
                />
              </Td>
              <Td>
                <DeletePurchaseControl purchaseId={purchase.purchase_id} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Pagination page={page} totalPages={totalPages} paramName="page" />
    </div>
  );
}
