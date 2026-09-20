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

type PurchaseGroup = {
  key: string;
  purchase_date: string;
  unit_price: number;
  vendor: string | null;
  quantity: number;
  ids: string[];
};

/** 같은 매입일·단가·매입처를 가진 행을 하나로 합친다 — 재고 상태를 옮기면서
 * 원래 하나였던 매입이 여러 행으로 쪼개진 경우, 매입 이력에서는 다시
 * 하나처럼 보여준다. */
function groupPurchases(purchases: Purchase[]): PurchaseGroup[] {
  const groups = new Map<string, PurchaseGroup>();
  for (const p of purchases) {
    const key = `${p.purchase_date}|${p.unit_price}|${p.vendor ?? ""}`;
    const existing = groups.get(key);
    if (existing) {
      existing.quantity += p.quantity;
      existing.ids.push(p.id);
      continue;
    }
    groups.set(key, {
      key,
      purchase_date: p.purchase_date,
      unit_price: p.unit_price,
      vendor: p.vendor,
      quantity: p.quantity,
      ids: [p.id],
    });
  }
  return Array.from(groups.values());
}

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

  const groups = useMemo(() => groupPurchases(purchases), [purchases]);

  const dirtyKeys = useMemo(
    () =>
      Object.keys(edits).filter((key) => {
        const original = groups.find((g) => g.key === key)?.vendor ?? "";
        return edits[key] !== original;
      }),
    [edits, groups],
  );

  const isDirty = dirtyKeys.length > 0;

  const save = () => {
    setError(null);
    startTransition(async () => {
      try {
        await Promise.all(
          dirtyKeys.flatMap((key) => {
            const group = groups.find((g) => g.key === key);
            if (!group) return [];
            return group.ids.map((id) => updateVendor(productId, id, edits[key]));
          }),
        );
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
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {groups.map((group) => (
            <Tr key={group.key}>
              <Td>{formatDate(group.purchase_date)}</Td>
              <Td>{group.quantity}</Td>
              <Td>{formatCurrency(group.unit_price)}</Td>
              <Td>{formatCurrency(group.quantity * group.unit_price)}</Td>
              <Td>
                <Input
                  size="s"
                  placeholder="매입처"
                  value={edits[group.key] ?? group.vendor ?? ""}
                  onChange={(e) =>
                    setEdits((prev) => ({ ...prev, [group.key]: e.target.value }))
                  }
                />
              </Td>
              <Td>
                <DeletePurchaseControl purchaseIds={group.ids} />
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
