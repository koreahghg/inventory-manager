import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Alert } from "@/shared/ui/Alert";
import { Pagination } from "@/shared/ui/Pagination";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { safely } from "@/shared/lib/safe";
import { listSales } from "@/entities/sale/api";
import { CancelSaleControl } from "@/features/sale/cancel-sale/ui";

export function preload(page: number) {
  void listSales(page);
}

export async function SaleList({ page }: { page: number }) {
  const result = await safely(() => listSales(page));

  if (!result.ok) {
    return (
      <Alert tone="warning" message="판매 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." />
    );
  }

  const { rows: sales, totalPages } = result.data;

  if (sales.length === 0) {
    return <EmptyState message="판매 기록이 없습니다." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <Thead>
          <Tr>
            <Th>판매일</Th>
            <Th>상품</Th>
            <Th>수량</Th>
            <Th>판매가격</Th>
            <Th>플랫폼</Th>
            <Th>순이익</Th>
            <Th>상태</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sales.map((sale) => (
            <Tr key={sale.id} className={sale.canceled_at ? "opacity-50" : undefined}>
              <Td>{formatDate(sale.sale_date)}</Td>
              <Td>
                <Link href={`/products/${sale.product_id}`} className="hover:underline">
                  {sale.product_name}
                </Link>
              </Td>
              <Td>{sale.quantity}</Td>
              <Td>{formatCurrency(sale.sale_price)}</Td>
              <Td>{sale.platform ?? "-"}</Td>
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
      <Pagination page={page} totalPages={totalPages} paramName="salePage" />
    </div>
  );
}
