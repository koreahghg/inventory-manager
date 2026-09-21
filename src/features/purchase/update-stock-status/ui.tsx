"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { useToast } from "@/shared/ui/toast";
import type { StockStatus } from "@/entities/purchase/model";
import { QuickSellForm } from "@/features/sale/quick-sell/ui";
import { moveStockStatusForBatches } from "./actions";

const NEXT_STATUS: Record<StockStatus, StockStatus> = {
  online: "in_transit",
  in_transit: "in_hand",
  in_hand: "online",
};

/** 재고 현황 홈 화면과 재고관리 표에서 공용으로 쓰는 상태 조작 — 드롭다운
 * 없이 "이동" 버튼 하나로 온라인→배송중→보유→온라인 순서로 한 칸씩
 * 돌아가고, "판매" 버튼은 바로 판매 등록 모달을 띄운다. batches가 여러
 * 개면(재고관리에서 합쳐진 행) 그 배치들에서만 필요한 만큼 소비한다. */
export function CycleStockStatusControl({
  status,
  remainingQuantity,
  batches,
  showMove = true,
}: {
  status: StockStatus;
  remainingQuantity: number;
  batches: { purchase_id: string; remaining_quantity: number }[];
  showMove?: boolean;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [isPending, startTransition] = useTransition();
  const [sellModalOpen, setSellModalOpen] = useState(false);

  const sellBatch = [...batches].sort((a, b) => b.remaining_quantity - a.remaining_quantity)[0];

  return (
    <div className="flex items-center justify-end gap-2">
      {showMove && (
        <Button
          type="button"
          variant="secondary"
          size="s"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              try {
                await moveStockStatusForBatches(
                  batches.map((b) => ({
                    purchaseId: b.purchase_id,
                    remainingQuantity: b.remaining_quantity,
                  })),
                  remainingQuantity,
                  NEXT_STATUS[status],
                );
                router.refresh();
              } catch {
                showToast("상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
              }
            });
          }}
        >
          이동
        </Button>
      )}
      <Button type="button" size="s" onClick={() => setSellModalOpen(true)}>
        판매
      </Button>

      {sellModalOpen && sellBatch && (
        <Modal
          onClose={() => {
            setSellModalOpen(false);
            router.refresh();
          }}
        >
          <h2 className="mb-4 text-title-1 font-bold text-grey-900">판매 등록</h2>
          <QuickSellForm
            purchaseId={sellBatch.purchase_id}
            onClose={() => {
              setSellModalOpen(false);
              router.refresh();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
