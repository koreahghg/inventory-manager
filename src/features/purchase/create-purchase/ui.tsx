"use client";

import { useActionState, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import { Alert } from "@/shared/ui/Alert";
import { createPurchase, type CreatePurchaseState } from "./actions";
import { NEW_PRODUCT_VALUE } from "./constants";

type ProductOption = { id: string; name: string; brand: string | null };

const INITIAL_STATE: CreatePurchaseState = { error: null, success: false, resetToken: "" };

export function CreatePurchaseForm({
  products,
  onClose,
}: {
  products: ProductOption[];
  onClose?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(createPurchase, INITIAL_STATE);

  return (
    <PurchaseFormFields
      key={state.resetToken}
      products={products}
      formAction={formAction}
      error={state.error}
      isPending={isPending}
      onClose={onClose}
    />
  );
}

function PurchaseFormFields({
  products,
  formAction,
  error,
  isPending,
  onClose,
}: {
  products: ProductOption[];
  formAction: (formData: FormData) => void;
  error: string | null;
  isPending: boolean;
  onClose?: () => void;
}) {
  const [productId, setProductId] = useState("");
  const isNewProduct = productId === NEW_PRODUCT_VALUE;

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <Field label="상품" htmlFor="product_id" required>
          <Select
            id="product_id"
            name="product_id"
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="" disabled>
              상품 선택
            </option>
            <option value={NEW_PRODUCT_VALUE}>+ 새 상품 등록</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.brand ? `${product.brand} · ` : ""}
                {product.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {isNewProduct && (
        <>
          <div className="sm:col-span-2">
            <Field label="상품명" htmlFor="new_name" required>
              <Input id="new_name" name="new_name" placeholder="예: 에어포스 1 '07" required />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="상품 메모" htmlFor="new_memo">
              <Textarea id="new_memo" name="new_memo" rows={2} placeholder="메모를 입력해 주세요" />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="상품 이미지" htmlFor="images">
              <input
                id="images"
                name="images"
                type="file"
                accept="image/*"
                multiple
                className="text-body-2 text-grey-700 file:mr-3 file:rounded-m file:border-0 file:bg-grey-900 file:px-3 file:py-1.5 file:text-body-2 file:font-medium file:text-white"
              />
              <p className="text-caption text-grey-400">
                첫 번째로 선택한 이미지가 대표 이미지로 지정됩니다.
              </p>
            </Field>
          </div>
        </>
      )}

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
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            취소
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "등록 중..." : "매입 등록"}
        </Button>
      </div>
    </form>
  );
}
