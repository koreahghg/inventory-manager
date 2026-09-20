import Image from "next/image";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/shared/ui/Table";
import { formatCurrency, formatDate, formatQuantity } from "@/shared/lib/format";
import type { StockGroup } from "@/entities/purchase/model";
import { CycleStockStatusControl } from "@/features/purchase/update-stock-status/ui";
import { DeletePurchaseControl } from "@/features/purchase/delete-purchase/ui";

export function StockGroupTable({ groups }: { groups: StockGroup[] }) {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>이미지</Th>
          <Th>상품명</Th>
          <Th>매입일</Th>
          <Th>잔여 수량</Th>
          <Th>개당 매입가</Th>
          <Th>매입처</Th>
          <Th></Th>
          <Th></Th>
        </Tr>
      </Thead>
      <Tbody>
        {groups.map((group) => {
          const key = `${group.product_id}:${group.stock_status}:${group.purchase_date}:${group.unit_price}:${group.vendor ?? ""}`;
          const purchaseIds = group.batches.map((b) => b.purchase_id);

          return (
            <Tr key={key}>
              <Td>
                <Link href={`/products/${group.product_id}`}>
                  {group.product_image_url ? (
                    <Image
                      src={group.product_image_url}
                      alt={group.product_name}
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
                <Link href={`/products/${group.product_id}`} className="hover:underline">
                  {group.product_brand ? `${group.product_brand} · ` : ""}
                  {group.product_name}
                </Link>
              </Td>
              <Td>{formatDate(group.purchase_date)}</Td>
              <Td>
                {formatQuantity(group.remaining_quantity)}
                {group.remaining_quantity !== group.purchased_quantity
                  ? ` / ${formatQuantity(group.purchased_quantity)}`
                  : ""}
              </Td>
              <Td>{formatCurrency(group.unit_price)}</Td>
              <Td>{group.vendor ?? "-"}</Td>
              <Td>
                <CycleStockStatusControl
                  status={group.stock_status}
                  remainingQuantity={group.remaining_quantity}
                  batches={group.batches}
                  showMove={false}
                />
              </Td>
              <Td>
                <DeletePurchaseControl purchaseIds={purchaseIds} />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
