"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Select } from "@/shared/ui/Select";
import { Modal } from "@/shared/ui/Modal";
import { useToast } from "@/shared/ui/toast";
import { STOCK_STATUS_LABELS, type StockStatus } from "@/entities/purchase/model";
import { QuickSellForm } from "@/features/sale/quick-sell/ui";
import { updateStockStatus } from "./actions";

const STATUS_OPTIONS = Object.keys(STOCK_STATUS_LABELS) as StockStatus[];
const SELL_VALUE = "sell";

export function StockStatusSelect({
  purchaseId,
  status,
  remainingQuantity = 1,
}: {
  purchaseId: string;
  status: StockStatus;
  remainingQuantity?: number;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [isPending, startTransition] = useTransition();
  const [sellModalOpen, setSellModalOpen] = useState(false);

  return (
    <>
      <Select
        size="s"
        value={status}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value;
          if (next === SELL_VALUE) {
            setSellModalOpen(true);
            return;
          }
          startTransition(async () => {
            try {
              await updateStockStatus(purchaseId, next as StockStatus);
              router.refresh();
            } catch {
              showToast("상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
            }
          });
        }}
      >
        {STATUS_OPTIONS.map((key) => (
          <option key={key} value={key}>
            {STOCK_STATUS_LABELS[key]}
          </option>
        ))}
        <option value={SELL_VALUE}>판매</option>
      </Select>

      {sellModalOpen && (
        <Modal
          onClose={() => {
            setSellModalOpen(false);
            router.refresh();
          }}
        >
          <h2 className="mb-4 text-title-1 font-bold text-grey-900">판매 등록</h2>
          <QuickSellForm
            purchaseId={purchaseId}
            maxQuantity={remainingQuantity}
            onClose={() => {
              setSellModalOpen(false);
              router.refresh();
            }}
          />
        </Modal>
      )}
    </>
  );
}
