"use client";

import { useActionState } from "react";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Alert } from "@/shared/ui/Alert";
import { createPurchase, type CreatePurchaseState } from "./actions";

const INITIAL_STATE: CreatePurchaseState = { error: null, success: false, resetToken: "" };

export function CreatePurchaseForm({ onClose }: { onClose?: () => void }) {
  const [state, formAction, isPending] = useActionState(createPurchase, INITIAL_STATE);

  return (
    <PurchaseFormFields
      key={state.resetToken}
      formAction={formAction}
      error={state.error}
      isPending={isPending}
      onClose={onClose}
    />
  );
}

function PurchaseFormFields({
  formAction,
  error,
  isPending,
  onClose,
}: {
  formAction: (formData: FormData) => void;
  error: string | null;
  isPending: boolean;
  onClose?: () => void;
}) {
  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="상품명" htmlFor="product_name" required>
          <Input
            id="product_name"
            name="product_name"
            placeholder="예: 에어포스 1 '07"
            required
          />
        </Field>
        <p className="mt-1 text-caption text-grey-400">
          이미 등록된 상품명이면 매입만 추가되고, 없으면 상품이 새로 등록됩니다.
        </p>
      </div>

      <Field label="매입일" htmlFor="purchase_date" required>
        <Input id="purchase_date" name="purchase_date" type="date" placeholder="날짜 선택" required />
      </Field>

      <Field label="수량" htmlFor="quantity" required>
        <Input id="quantity" name="quantity" type="number" min={1} step={1} placeholder="0" required />
      </Field>

      <Field label="개당 매입가" htmlFor="unit_price" required>
        <Input id="unit_price" name="unit_price" type="number" min={0} step={1} placeholder="0" required />
      </Field>

      <Field label="매입처" htmlFor="vendor">
        <Input id="vendor" name="vendor" placeholder="예: 스탁엑스" />
      </Field>

      <div className="sm:col-span-2">
        <Field label="매입 메모" htmlFor="memo">
          <Textarea id="memo" name="memo" rows={2} placeholder="메모를 입력해 주세요" />
        </Field>
      </div>

      {error && (
        <div className="sm:col-span-2">
          <Alert message={error} />
        </div>
      )}

      <div className="flex gap-2 sm:col-span-2">
        {onClose && (
          <Button type="button" variant="secondary" size="l" className="flex-1" onClick={onClose}>
            취소
          </Button>
        )}
        <Button type="submit" size="l" className="flex-1" disabled={isPending}>
          {isPending ? "등록 중..." : "매입 등록"}
        </Button>
      </div>
    </form>
  );
}
