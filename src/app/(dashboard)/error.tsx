"use client";

import { useEffect } from "react";
import { Alert } from "@/shared/ui/Alert";
import { Button } from "@/shared/ui/Button";

export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-start gap-4">
      <Alert message="문제가 발생했습니다. 잠시 후 다시 시도해 주세요." />
      <Button variant="secondary" onClick={() => retry()}>
        다시 시도
      </Button>
    </div>
  );
}
