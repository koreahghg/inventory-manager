import { Table, Thead, Tbody, Tr, Th, Td } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Alert } from "@/shared/ui/Alert";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { safely } from "@/shared/lib/safe";
import { listSalesByProduct } from "@/entities/sale/api";
import { CancelSaleControl } from "@/features/sale/cancel-sale/ui";

export function preload(productId: string) {
  void listSalesByProduct(productId);
}

export async function SaleHistory({ productId }: { productId: string }) {
  const result = await safely(() => listSalesByProduct(productId));

  if (!result.ok) {
    return (
      <Alert tone="warning" message="판매 이력을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." />
    );
  }

  const sales = result.data;

  if (sales.length === 0) {
    return <EmptyState message="판매 이력이 없습니다." />;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>판매일</Th>
          <Th>수량</Th>
          <Th>판매가격</Th>
          <Th>플랫폼</Th>
          <Th>수수료</Th>
          <Th>배송비</Th>
          <Th>기타비용</Th>
          <Th>순이익</Th>
          <Th>상태</Th>
        </Tr>
      </Thead>
      <Tbody>
        {sales.map((sale) => (
          <Tr key={sale.id} className={sale.canceled_at ? "opacity-50" : undefined}>
            <Td>{formatDate(sale.sale_date)}</Td>
            <Td>{sale.quantity}</Td>
            <Td>{formatCurrency(sale.sale_price)}</Td>
            <Td>{sale.platform ?? "-"}</Td>
            <Td>{formatCurrency(sale.fee)}</Td>
            <Td>{formatCurrency(sale.shipping_fee)}</Td>
            <Td>{formatCurrency(sale.other_fee)}</Td>
            <Td className={sale.net_profit >= 0 ? "text-success" : "text-danger"}>
              {formatCurrency(sale.net_profit)}
            </Td>
            <Td>
              {sale.canceled_at ? (
                <Badge tone="gray">
                  취소됨{sale.cancel_reason ? ` · ${sale.cancel_reason}` : ""}
                </Badge>
              ) : (
                <CancelSaleControl saleId={sale.id} />
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
