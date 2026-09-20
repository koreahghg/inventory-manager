"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Alert } from "@/shared/ui/Alert";
import { registerLogistics, type RegisterLogisticsState } from "./actions";

const INITIAL_STATE: RegisterLogisticsState = { error: null, success: false };

export function RegisterLogisticsForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(registerLogistics, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <Field label="등록일" htmlFor="registered_at" required>
        <Input
          id="registered_at"
          name="registered_at"
          type="date"
          size="l"
          placeholder="날짜 선택"
          required
        />
      </Field>

      <Field label="등록금" htmlFor="fee" required>
        <Input
          id="fee"
          name="fee"
          type="number"
          min={0}
          step={1}
          size="l"
          placeholder="0"
          required
        />
      </Field>

      <Field label="메모" htmlFor="logistics_memo">
        <Textarea id="logistics_memo" name="memo" rows={2} placeholder="메모를 입력해 주세요" />
      </Field>

      {state.error && <Alert message={state.error} />}

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" size="l" className="flex-1" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" size="l" disabled={isPending} className="flex-1">
          {isPending ? "등록 중..." : "등록"}
        </Button>
      </div>
    </form>
  );
}
