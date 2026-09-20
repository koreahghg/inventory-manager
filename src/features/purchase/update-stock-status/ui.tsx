"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Select } from "@/shared/ui/Select";
import { Modal } from "@/shared/ui/Modal";
import { Input } from "@/shared/ui/Input";
import { Field } from "@/shared/ui/Field";
import { Button } from "@/shared/ui/Button";
import { useToast } from "@/shared/ui/toast";
import { STOCK_STATUS_LABELS, type StockStatus } from "@/entities/purchase/model";
import { QuickSellForm } from "@/features/sale/quick-sell/ui";
import { updateStockStatus, splitStockStatus, moveStockStatus } from "./actions";

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
  const [splitTarget, setSplitTarget] = useState<StockStatus | null>(null);
  const [splitQuantity, setSplitQuantity] = useState(remainingQuantity);

  const applyStatus = (next: StockStatus) => {
    startTransition(async () => {
      try {
        await updateStockStatus(purchaseId, next);
        router.refresh();
      } catch {
        showToast("상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  };

  return (
    <>
      <Select
        size="s"
        value={status}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value;
          if (next === status) return;
          if (next === SELL_VALUE) {
            setSellModalOpen(true);
            return;
          }
          if (remainingQuantity > 1) {
            setSplitQuantity(remainingQuantity);
            setSplitTarget(next as StockStatus);
            return;
          }
          applyStatus(next as StockStatus);
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

      {splitTarget && (
        <Modal onClose={() => setSplitTarget(null)}>
          <h2 className="mb-4 text-title-1 font-bold text-grey-900">
            {STOCK_STATUS_LABELS[splitTarget]}(으)로 이동
          </h2>
          <Field label={`이동할 수량 (최대 ${remainingQuantity}개)`} htmlFor="split_quantity" required>
            <Input
              id="split_quantity"
              type="number"
              min={1}
              max={remainingQuantity}
              value={splitQuantity}
              onChange={(e) => setSplitQuantity(Number(e.target.value))}
            />
          </Field>
          <div className="mt-6 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="l"
              className="flex-1"
              onClick={() => setSplitTarget(null)}
            >
              취소
            </Button>
            <Button
              type="button"
              size="l"
              className="flex-1"
              disabled={
                isPending || !Number.isInteger(splitQuantity) || splitQuantity < 1 ||
                splitQuantity > remainingQuantity
              }
              onClick={() => {
                const target = splitTarget;
                const quantity = splitQuantity;
                setSplitTarget(null);
                startTransition(async () => {
                  try {
                    await splitStockStatus(purchaseId, quantity, target);
                    router.refresh();
                  } catch {
                    showToast("상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
                  }
                });
              }}
            >
              {isPending ? "처리 중..." : "이동"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

/** 재고 현황 홈 화면의 (상품, 상태) 합산 카드용 — 여러 매입 배치를 오래된
 * 것부터(FIFO) 소비하며 상태를 옮긴다. 판매는 남은 수량이 가장 많은 배치를
 * 대상으로 한다. */
export function GroupedStockStatusSelect({
  productId,
  status,
  remainingQuantity,
  batches,
}: {
  productId: string;
  status: StockStatus;
  remainingQuantity: number;
  batches: { purchase_id: string; remaining_quantity: number }[];
}) {
  const router = useRouter();
  const showToast = useToast();
  const [isPending, startTransition] = useTransition();
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<StockStatus | null>(null);
  const [moveQuantity, setMoveQuantity] = useState(remainingQuantity);

  const sellBatch = [...batches].sort((a, b) => b.remaining_quantity - a.remaining_quantity)[0];

  const applyMove = (quantity: number, next: StockStatus) => {
    startTransition(async () => {
      try {
        await moveStockStatus(productId, status, quantity, next);
        router.refresh();
      } catch {
        showToast("상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  };

  return (
    <>
      <Select
        size="s"
        value={status}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value;
          if (next === status) return;
          if (next === SELL_VALUE) {
            setSellModalOpen(true);
            return;
          }
          if (remainingQuantity > 1) {
            setMoveQuantity(remainingQuantity);
            setMoveTarget(next as StockStatus);
            return;
          }
          applyMove(remainingQuantity, next as StockStatus);
        }}
      >
        {STATUS_OPTIONS.map((key) => (
          <option key={key} value={key}>
            {STOCK_STATUS_LABELS[key]}
          </option>
        ))}
        <option value={SELL_VALUE}>판매</option>
      </Select>

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
            maxQuantity={sellBatch.remaining_quantity}
            onClose={() => {
              setSellModalOpen(false);
              router.refresh();
            }}
          />
        </Modal>
      )}

      {moveTarget && (
        <Modal onClose={() => setMoveTarget(null)}>
          <h2 className="mb-4 text-title-1 font-bold text-grey-900">
            {STOCK_STATUS_LABELS[moveTarget]}(으)로 이동
          </h2>
          <Field label={`이동할 수량 (최대 ${remainingQuantity}개)`} htmlFor="move_quantity" required>
            <Input
              id="move_quantity"
              type="number"
              min={1}
              max={remainingQuantity}
              value={moveQuantity}
              onChange={(e) => setMoveQuantity(Number(e.target.value))}
            />
          </Field>
          <div className="mt-6 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="l"
              className="flex-1"
              onClick={() => setMoveTarget(null)}
            >
              취소
            </Button>
            <Button
              type="button"
              size="l"
              className="flex-1"
              disabled={
                isPending || !Number.isInteger(moveQuantity) || moveQuantity < 1 ||
                moveQuantity > remainingQuantity
              }
              onClick={() => {
                const target = moveTarget;
                const quantity = moveQuantity;
                setMoveTarget(null);
                applyMove(quantity, target);
              }}
            >
              {isPending ? "처리 중..." : "이동"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
