"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/shared/ui/Input";

export function ProductFilter({ q }: { q: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(q);
  const [, startTransition] = useTransition();

  function navigate(nextQ: string) {
    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    startTransition(() => {
      router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
    });
  }

  return (
    <Input
      placeholder="상품명, 브랜드, 품번 검색"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(value);
      }}
      onBlur={() => navigate(value)}
      className="w-56"
    />
  );
}
