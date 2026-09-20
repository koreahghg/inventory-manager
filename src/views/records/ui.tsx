import { Suspense } from "react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Button } from "@/shared/ui/Button";
import { TableSkeleton } from "@/shared/ui/Skeleton";
import { RecordFilter } from "@/widgets/record-filter/ui";
import { TransactionList, preload as preloadTransactions } from "@/widgets/transaction-list/ui";
import type { TransactionType } from "@/entities/transaction/model";

export type RecordsSearchParams = {
  type?: string;
  page?: string;
};

function parseType(value: string | undefined): TransactionType | undefined {
  return value === "purchase" || value === "sale" ? value : undefined;
}

export async function RecordsPage({ searchParams }: { searchParams: RecordsSearchParams }) {
  const type = parseType(searchParams.type);
  const page = Math.max(1, Number(searchParams.page) || 1);

  preloadTransactions(page, type);

  const exportHref = type ? `/api/export/records?type=${type}` : "/api/export/records";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="기록"
        description="매입과 판매 기록을 한눈에 확인하고 엑셀로 내보낼 수 있습니다."
        action={
          <a href={exportHref}>
            <Button variant="secondary">CSV 다운로드</Button>
          </a>
        }
      />
      <RecordFilter type={type ?? "all"} />
      <Suspense fallback={<TableSkeleton />}>
        <TransactionList page={page} type={type} />
      </Suspense>
    </div>
  );
}
