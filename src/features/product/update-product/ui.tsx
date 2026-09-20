"use client";

import { useActionState } from "react";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Alert } from "@/shared/ui/Alert";
import { Card } from "@/shared/ui/Card";
import { updateProduct, type UpdateProductState } from "./actions";
import type { Product } from "@/entities/product/model";

const INITIAL_STATE: UpdateProductState = { error: null };

export function UpdateProductForm({ product }: { product: Product }) {
  const boundAction = updateProduct.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(boundAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="상품명" htmlFor="edit_name" required>
            <Input
              id="edit_name"
              name="name"
              placeholder="예: 에어포스 1 '07"
              defaultValue={product.name}
              required
            />
          </Field>
          <Field label="브랜드" htmlFor="edit_brand">
            <Input
              id="edit_brand"
              name="brand"
              placeholder="예: 나이키"
              defaultValue={product.brand ?? ""}
            />
          </Field>
          <Field label="품번" htmlFor="edit_style_code">
            <Input
              id="edit_style_code"
              name="style_code"
              placeholder="예: CW2288-111"
              defaultValue={product.style_code ?? ""}
            />
          </Field>
          <Field label="사이즈" htmlFor="edit_size">
            <Input
              id="edit_size"
              name="size"
              placeholder="예: 270"
              defaultValue={product.size ?? ""}
            />
          </Field>
          <Field label="색상" htmlFor="edit_color">
            <Input
              id="edit_color"
              name="color"
              placeholder="예: 화이트"
              defaultValue={product.color ?? ""}
            />
          </Field>
        </div>

        <Field label="메모" htmlFor="edit_memo">
          <Textarea
            id="edit_memo"
            name="memo"
            rows={2}
            placeholder="메모를 입력해 주세요"
            defaultValue={product.memo ?? ""}
          />
        </Field>
      </Card>

      {state.error && <Alert message={state.error} />}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}
