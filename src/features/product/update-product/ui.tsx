"use client";

import { useActionState } from "react";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Alert } from "@/shared/ui/Alert";
import { Card } from "@/shared/ui/Card";
import { ProductGallery } from "@/widgets/product-gallery/ui";
import { updateProduct, type UpdateProductState } from "./actions";
import type { Product } from "@/entities/product/model";

const INITIAL_STATE: UpdateProductState = { error: null };

export function UpdateProductForm({ product }: { product: Product }) {
  const boundAction = updateProduct.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(boundAction, INITIAL_STATE);

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <h2 className="text-title-2 font-bold text-grey-900">이미지</h2>
        <ProductGallery imageUrl={product.image_url} productName={product.name} productId={product.id} />
      </Card>

      <form action={formAction} className="flex flex-col gap-6">
        <Card className="flex flex-col gap-4">
          <Field label="상품명" htmlFor="edit_name" required>
            <Input
              id="edit_name"
              name="name"
              placeholder="예: 에어포스 1 '07"
              defaultValue={product.name}
              required
            />
          </Field>

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
    </div>
  );
}
