"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { Textarea } from "@/shared/ui/Textarea";
import { useToast } from "@/shared/ui/toast";
import { updateProductMemo } from "./actions";

export function ProductMemoButton({
  productId,
  productName,
  memo,
  className,
}: {
  productId: string;
  productName: string;
  memo: string | null;
  className?: string;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(memo ?? "");
  const [isPending, startTransition] = useTransition();

  const close = () => setOpen(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`text-left ${className ?? ""}`}>
        {productName}
      </button>

      <Modal open={open} onClose={close}>
        <h2 className="mb-4 text-title-1 font-bold text-grey-900">{productName}</h2>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="메모를 입력해 주세요"
          className="h-40 w-full resize-none"
        />
        <div className="mt-4 flex gap-2">
          <Button type="button" variant="secondary" size="l" className="flex-1" onClick={close}>
            취소
          </Button>
          <Button
            type="button"
            size="l"
            className="flex-1"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                try {
                  await updateProductMemo(productId, value);
                  router.refresh();
                  close();
                } catch {
                  showToast("메모 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
                }
              });
            }}
          >
            {isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
