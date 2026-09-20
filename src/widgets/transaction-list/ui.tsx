import { Table, Thead, Tbody, Tr, Th, Td } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Alert } from "@/shared/ui/Alert";
import { Pagination } from "@/shared/ui/Pagination";
import { formatCurrency, formatDate, formatQuantity } from "@/shared/lib/format";
import { safely } from "@/shared/lib/safe";
import { listTransactions } from "@/entities/transaction/api";
import type { TransactionType } from "@/entities/transaction/model";
import { CancelSaleControl } from "@/features/sale/cancel-sale/ui";

export function preload(page: number, type?: TransactionType) {
  void listTransactions(page, type);
}

export async function TransactionList({
  page,
  type,
}: {
  page: number;
  type?: TransactionType;
}) {
  const result = await safely(() => listTransactions(page, type));

  if (!result.ok) {
    return (
      <Alert tone="warning" message="기록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." />
    );
  }

  const { rows: transactions, totalPages } = result.data;

  if (transactions.length === 0) {
    return <EmptyState message="기록이 없습니다." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <Thead>
          <Tr>
            <Th>구분</Th>
            <Th>날짜</Th>
            <Th>상품</Th>
            <Th>수량</Th>
            <Th>단가</Th>
            <Th>총금액</Th>
            <Th>거래처</Th>
            <Th>순이익</Th>
            <Th>상태</Th>
            <Th>메모</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions.map((tx) => (
            <Tr key={`${tx.type}-${tx.id}`} className={tx.canceled_at ? "opacity-50" : undefined}>
              <Td>
                {tx.type === "purchase" ? (
                  <Badge tone="blue">매입</Badge>
                ) : (
                  <Badge tone="gray">판매</Badge>
                )}
              </Td>
              <Td>{formatDate(tx.record_date)}</Td>
              <Td>
                {tx.product_brand ? `${tx.product_brand} · ` : ""}
                {tx.product_name}
              </Td>
              <Td>{formatQuantity(tx.quantity)}</Td>
              <Td>{formatCurrency(tx.unit_amount)}</Td>
              <Td>{formatCurrency(tx.total_amount)}</Td>
              <Td>{tx.counterparty ?? "-"}</Td>
              <Td className={tx.net_profit >= 0 ? "text-success" : "text-danger"}>
                {formatCurrency(tx.net_profit)}
              </Td>
              <Td>
                {tx.type === "sale" ? (
                  tx.canceled_at ? (
                    <Badge tone="gray">취소됨</Badge>
                  ) : (
                    <CancelSaleControl saleId={tx.id} />
                  )
                ) : (
                  "-"
                )}
              </Td>
              <Td>{tx.memo ?? "-"}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Pagination page={page} totalPages={totalPages} paramName="page" />
    </div>
  );
}
