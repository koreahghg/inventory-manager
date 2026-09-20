"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/shared/ui/Table";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import type { Purchase } from "@/entities/purchase/model";
import { updateVendor } from "@/features/purchase/update-vendor/actions";
import { DeletePurchaseControl } from "@/features/purchase/delete-purchase/ui";

export function PurchaseHistoryTable({
  productId,
  purchases,
}: {
  productId: string;
  purchases: Purchase[];
}) {
  const router = useRouter();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirtyIds = useMemo(
    () =>
      Object.keys(edits).filter((id) => {
        const original = purchases.find((p) => p.id === id)?.vendor ?? "";
        return edits[id] !== original;
      }),
    [edits, purchases],
  );

  const isDirty = dirtyIds.length > 0;

  const save = () => {
    setError(null);
    startTransition(async () => {
      try {
        await Promise.all(dirtyIds.map((id) => updateVendor(productId, id, edits[id])));
        router.refresh();
        setConfirmOpen(false);
        setEdits({});
      } catch {
        setError("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-title-2 font-bold text-grey-900">매입 이력</h2>
        {isDirty && (
          <Button type="button" size="s" onClick={() => setConfirmOpen(true)}>
            저장
          </Button>
        )}
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>매입일</Th>
            <Th>수량</Th>
            <Th>개당 매입가</Th>
            <Th>총 매입금액</Th>
            <Th>매입처</Th>
            <Th>메모</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {purchases.map((purchase) => (
            <Tr key={purchase.id}>
              <Td>{formatDate(purchase.purchase_date)}</Td>
              <Td>{purchase.quantity}</Td>
              <Td>{formatCurrency(purchase.unit_price)}</Td>
              <Td>{formatCurrency(purchase.quantity * purchase.unit_price)}</Td>
              <Td>
                <Input
                  size="s"
                  placeholder="매입처"
                  value={edits[purchase.id] ?? purchase.vendor ?? ""}
                  onChange={(e) =>
                    setEdits((prev) => ({ ...prev, [purchase.id]: e.target.value }))
                  }
                />
              </Td>
              <Td>{purchase.memo ?? "-"}</Td>
              <Td>
                <DeletePurchaseControl purchaseId={purchase.id} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {confirmOpen && (
        <Modal onClose={() => setConfirmOpen(false)}>
          <h2 className="mb-2 text-title-1 font-bold text-grey-900">매입처 저장</h2>
          <p className="mb-6 text-body-2 text-grey-600">변경한 매입처를 저장하시겠습니까?</p>
          {error && <p className="mb-4 text-body-2 text-danger">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="l"
              className="flex-1"
              onClick={() => setConfirmOpen(false)}
            >
              취소
            </Button>
            <Button type="button" size="l" className="flex-1" disabled={isPending} onClick={save}>
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
