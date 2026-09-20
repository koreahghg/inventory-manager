"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "./Button";

export function Pagination({
  page,
  totalPages,
  paramName = "page",
}: {
  page: number;
  totalPages: number;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="secondary"
        size="s"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
      >
        이전
      </Button>
      <span className="text-body-2 tabular-nums text-grey-500">
        {page} / {totalPages}
      </span>
      <Button
        variant="secondary"
        size="s"
        disabled={page >= totalPages}
        onClick={() => goTo(page + 1)}
      >
        다음
      </Button>
    </div>
  );
}
