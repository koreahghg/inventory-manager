import { Table, Thead, Tbody, Tr, Th, Td } from "@/shared/ui/Table";
import { EmptyState } from "@/shared/ui/EmptyState";
import { formatCurrency, formatQuantity } from "@/shared/lib/format";
import type { BreakdownRow } from "@/entities/stats/model";

export function StatsTable({ rows }: { rows: BreakdownRow[] }) {
  const hasData = rows.some(
    (r) => r.purchaseQuantity > 0 || r.saleQuantity > 0,
  );

  if (!hasData) {
    return <EmptyState message="해당 기간의 데이터가 없습니다." />;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>기간</Th>
          <Th>총 매입금액</Th>
          <Th>총 판매금액</Th>
          <Th>총 순이익</Th>
          <Th>매입 수량</Th>
          <Th>판매 수량</Th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <Tr key={row.key}>
            <Td className="font-medium text-grey-900">{row.label}</Td>
            <Td>{formatCurrency(row.purchaseAmount)}</Td>
            <Td>{formatCurrency(row.saleAmount)}</Td>
            <Td className={row.netProfit >= 0 ? "text-success" : "text-danger"}>
              {formatCurrency(row.netProfit)}
            </Td>
            <Td>{formatQuantity(row.purchaseQuantity)}</Td>
            <Td>{formatQuantity(row.saleQuantity)}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
