"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/shared/ui/Button";
import { deletePurchase } from "./actions";

export function DeletePurchaseControl({ purchaseId }: { purchaseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-caption font-medium text-danger hover:underline"
      >
        삭제
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 whitespace-nowrap">
        <span className="text-caption text-grey-500">삭제할까요?</span>
        <Button
          type="button"
          variant="danger"
          size="s"
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              try {
                await deletePurchase(purchaseId);
                router.refresh();
              } catch (e) {
                setError(e instanceof Error ? e.message : "삭제에 실패했습니다.");
              }
            });
          }}
        >
          {isPending ? "삭제 중" : "확인"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="text-caption text-grey-400 hover:text-grey-600"
        >
          취소
        </button>
      </div>
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  );
}
