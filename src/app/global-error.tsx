"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="ko">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-grey-50 text-grey-900">
        <p className="text-body-2 text-grey-600">문제가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>
        <button
          type="button"
          onClick={() => retry()}
          className="h-10 rounded-m bg-grey-100 px-4 text-label-m font-semibold text-grey-900 hover:bg-grey-150"
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
