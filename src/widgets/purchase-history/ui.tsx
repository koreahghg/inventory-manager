import { Table, Thead, Tbody, Tr, Th, Td } from "@/shared/ui/Table";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Alert } from "@/shared/ui/Alert";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { safely } from "@/shared/lib/safe";
import { listPurchasesByProduct } from "@/entities/purchase/api";

export function preload(productId: string) {
  void listPurchasesByProduct(productId);
}

export async function PurchaseHistory({ productId }: { productId: string }) {
  const result = await safely(() => listPurchasesByProduct(productId));

  if (!result.ok) {
    return (
      <Alert tone="warning" message="매입 이력을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." />
    );
  }

  const purchases = result.data;

  if (purchases.length === 0) {
    return <EmptyState message="매입 이력이 없습니다." />;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>매입일</Th>
          <Th>수량</Th>
          <Th>개당 매입가</Th>
          <Th>총 매입금액</Th>
          <Th>매입처</Th>
          <Th>메모</Th>
        </Tr>
      </Thead>
      <Tbody>
        {purchases.map((purchase) => (
          <Tr key={purchase.id}>
            <Td>{formatDate(purchase.purchase_date)}</Td>
            <Td>{purchase.quantity}</Td>
            <Td>{formatCurrency(purchase.unit_price)}</Td>
            <Td>{formatCurrency(purchase.quantity * purchase.unit_price)}</Td>
            <Td>{purchase.vendor ?? "-"}</Td>
            <Td>{purchase.memo ?? "-"}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
