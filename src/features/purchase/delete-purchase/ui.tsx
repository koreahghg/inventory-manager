"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { deletePurchase } from "./actions";

export function DeletePurchaseControl({ purchaseIds }: { purchaseIds: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const close = () => {
    setOpen(false);
    setError(null);
  };

  const multi = purchaseIds.length > 1;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-caption font-medium text-danger hover:underline"
      >
        삭제
      </button>

      {open && (
        <Modal onClose={close}>
          <h2 className="mb-2 text-title-1 font-bold text-grey-900">매입 기록 삭제</h2>
          <p className="mb-6 text-body-2 text-grey-600">
            {multi
              ? `이 매입 기록(${purchaseIds.length}건)을 모두 삭제하시겠습니까? 삭제하면 되돌릴 수 없습니다.`
              : "이 매입 기록을 삭제하시겠습니까? 삭제하면 되돌릴 수 없습니다."}
          </p>
          {error && <p className="mb-4 text-body-2 text-danger">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="l" className="flex-1" onClick={close}>
              취소
            </Button>
            <Button
              type="button"
              variant="danger"
              size="l"
              className="flex-1"
              disabled={isPending}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  try {
                    await Promise.all(purchaseIds.map((id) => deletePurchase(id)));
                    router.refresh();
                    close();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "삭제에 실패했습니다.");
                  }
                });
              }}
            >
              {isPending ? "삭제 중..." : "삭제"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
