"use client";

import { useActionState, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Alert } from "@/shared/ui/Alert";
import { cancelSale, type CancelSaleState } from "./actions";

const INITIAL_STATE: CancelSaleState = { error: null };

export function CancelSaleControl({ saleId }: { saleId: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = cancelSale.bind(null, saleId);
  const [state, formAction, isPending] = useActionState(boundAction, INITIAL_STATE);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-caption font-medium text-danger hover:underline"
      >
        취소 처리
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Input
          name="reason"
          placeholder="취소 사유(선택)"
          size="s"
          className="w-32"
        />
        <Button type="submit" variant="danger" size="s" disabled={isPending}>
          {isPending ? "처리 중" : "확인"}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-caption text-grey-400 hover:text-grey-600"
        >
          닫기
        </button>
      </div>
      {state.error && <Alert message={state.error} />}
    </form>
  );
}
