"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Alert } from "@/shared/ui/Alert";
import { createSale, type CreateSaleState } from "@/features/sale/create-sale/actions";

const INITIAL_STATE: CreateSaleState = { error: null, success: false, resetToken: "" };

export function QuickSellForm({
  purchaseId,
  onClose,
}: {
  purchaseId: string;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(createSale, INITIAL_STATE);

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="purchase_id" value={purchaseId} />
      <input type="hidden" name="quantity" value={1} />

      <Field label="판매일" htmlFor="quick_sale_date" required>
        <Input id="quick_sale_date" name="sale_date" type="date" placeholder="날짜 선택" required />
      </Field>

      <Field label="판매가격" htmlFor="quick_sale_price" required>
        <Input
          id="quick_sale_price"
          name="sale_price"
          type="number"
          min={0}
          step={1}
          placeholder="0"
          required
        />
      </Field>

      <Field label="판매 플랫폼" htmlFor="quick_platform">
        <Input id="quick_platform" name="platform" placeholder="예: 크림" />
      </Field>

      <div className="grid grid-cols-3 gap-2">
        <Field label="수수료" htmlFor="quick_fee">
          <Input id="quick_fee" name="fee" type="number" min={0} step={1} placeholder="0" defaultValue={0} />
        </Field>
        <Field label="배송비" htmlFor="quick_shipping_fee">
          <Input
            id="quick_shipping_fee"
            name="shipping_fee"
            type="number"
            min={0}
            step={1}
            placeholder="0"
            defaultValue={0}
          />
        </Field>
        <Field label="기타비용" htmlFor="quick_other_fee">
          <Input
            id="quick_other_fee"
            name="other_fee"
            type="number"
            min={0}
            step={1}
            placeholder="0"
            defaultValue={0}
          />
        </Field>
      </div>

      {state.error && <Alert message={state.error} />}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="l" className="flex-1" onClick={onClose}>
          취소
        </Button>
        <Button type="submit" size="l" className="flex-1" disabled={isPending}>
          {isPending ? "등록 중..." : "판매 등록"}
        </Button>
      </div>
    </form>
  );
}
