"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/shared/ui/Table";
import { formatCurrency, formatDate, formatQuantity } from "@/shared/lib/format";
import type { StockGroup } from "@/entities/purchase/model";
import { StockStatusSelect, GroupedStockStatusSelect } from "@/features/purchase/update-stock-status/ui";
import { DeletePurchaseControl } from "@/features/purchase/delete-purchase/ui";

export function StockGroupTable({ groups }: { groups: StockGroup[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <Table>
      <Thead>
        <Tr>
          <Th></Th>
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
        {groups.map((group) => {
          const key = `${group.product_id}:${group.stock_status}`;
          const isMulti = group.batches.length > 1;
          const isOpen = expanded.has(key);
          const single = group.batches[0];

          return (
            <Fragment key={key}>
              <Tr>
                <Td>
                  {isMulti && (
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      aria-expanded={isOpen}
                      aria-label="배치 펼치기"
                      className="flex h-6 w-6 items-center justify-center rounded-m text-grey-400 hover:bg-grey-100 hover:text-grey-700"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className={`h-4 w-4 transition-transform duration-200 ease-toss ${isOpen ? "rotate-90" : ""}`}
                      >
                        <path
                          d="M7.5 5L12.5 10L7.5 15"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </Td>
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
                <Td>{isMulti ? `${group.batches.length}건` : formatDate(single.purchase_date)}</Td>
                <Td>{formatQuantity(group.remaining_quantity)}</Td>
                <Td>{isMulti ? "-" : formatCurrency(single.unit_price)}</Td>
                <Td>{isMulti ? "-" : (single.vendor ?? "-")}</Td>
                <Td>
                  {isMulti ? (
                    <GroupedStockStatusSelect
                      productId={group.product_id}
                      status={group.stock_status}
                      remainingQuantity={group.remaining_quantity}
                      batches={group.batches}
                    />
                  ) : (
                    <StockStatusSelect
                      purchaseId={single.purchase_id}
                      status={single.stock_status}
                      remainingQuantity={single.remaining_quantity}
                    />
                  )}
                </Td>
                <Td>{!isMulti && <DeletePurchaseControl purchaseIds={[single.purchase_id]} />}</Td>
              </Tr>

              {isMulti &&
                isOpen &&
                group.batches.map((batch) => (
                  <Tr key={batch.purchase_id} className="bg-grey-50">
                    <Td></Td>
                    <Td></Td>
                    <Td className="pl-6 text-caption text-grey-400">배치</Td>
                    <Td>{formatDate(batch.purchase_date)}</Td>
                    <Td>
                      {formatQuantity(batch.remaining_quantity)}
                      {batch.remaining_quantity !== batch.purchased_quantity
                        ? ` / ${formatQuantity(batch.purchased_quantity)}`
                        : ""}
                    </Td>
                    <Td>{formatCurrency(batch.unit_price)}</Td>
                    <Td>{batch.vendor ?? "-"}</Td>
                    <Td>
                      <StockStatusSelect
                        purchaseId={batch.purchase_id}
                        status={batch.stock_status}
                        remainingQuantity={batch.remaining_quantity}
                      />
                    </Td>
                    <Td>
                      <DeletePurchaseControl purchaseIds={[batch.purchase_id]} />
                    </Td>
                  </Tr>
                ))}
            </Fragment>
          );
        })}
      </Tbody>
    </Table>
  );
}
