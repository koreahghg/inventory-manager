"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/shared/ui/Input";
import { useToast } from "@/shared/ui/toast";
import { updateVendor } from "./actions";

export function VendorInput({
  productId,
  purchaseId,
  vendor,
}: {
  productId: string;
  purchaseId: string;
  vendor: string | null;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(vendor ?? "");

  const save = () => {
    if (value === (vendor ?? "")) return;
    startTransition(async () => {
      try {
        await updateVendor(productId, purchaseId, value);
        router.refresh();
      } catch {
        showToast("매입처 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  };

  return (
    <Input
      size="s"
      value={value}
      disabled={isPending}
      placeholder="매입처"
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
    />
  );
}
