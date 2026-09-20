"use client";

import { useRef, useTransition, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/ui/toast";
import { uploadProductImages } from "./actions";

export function ImageUploadTrigger({
  productId,
  className,
  children,
}: {
  productId: string;
  className?: string;
  children: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const showToast = useToast();
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    startTransition(async () => {
      try {
        await uploadProductImages(productId, formData);
        router.refresh();
      } catch {
        showToast("이미지 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  };

  return (
    <label
      className={`cursor-pointer ${isPending ? "pointer-events-none opacity-50" : ""} ${className ?? ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={isPending}
        onChange={handleChange}
      />
      {children}
    </label>
  );
}
