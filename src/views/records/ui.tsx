import { Suspense } from "react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Button } from "@/shared/ui/Button";
import { TableSkeleton } from "@/shared/ui/Skeleton";
import { TransactionList, preload as preloadTransactions } from "@/widgets/transaction-list/ui";
import {
  PurchaseRecordList,
  preload as preloadPurchaseRecords,
} from "@/widgets/purchase-record-list/ui";
import { SaleRecordList, preload as preloadSaleRecords } from "@/widgets/sale-record-list/ui";

export type RecordsSearchParams = {
  allPage?: string;
  purchasePage?: string;
  salePage?: string;
};

export async function RecordsPage({ searchParams }: { searchParams: RecordsSearchParams }) {
  const allPage = Math.max(1, Number(searchParams.allPage) || 1);
  const purchasePage = Math.max(1, Number(searchParams.purchasePage) || 1);
  const salePage = Math.max(1, Number(searchParams.salePage) || 1);

  preloadTransactions(allPage);
  preloadPurchaseRecords(purchasePage);
  preloadSaleRecords(salePage);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="전체 기록"
          description="매입과 판매를 날짜순으로 합친 전체 거래 기록입니다."
          action={
            <a href="/api/export/records">
              <Button variant="secondary">CSV 다운로드</Button>
            </a>
          }
        />
        <Suspense fallback={<TableSkeleton />}>
          <TransactionList page={allPage} />
        </Suspense>
      </div>

      <div className="flex flex-col gap-6">
        <PageHeader
          title="매입 기록"
          description="전체 매입 내역입니다."
          action={
            <a href="/api/export/purchases">
              <Button variant="secondary">CSV 다운로드</Button>
            </a>
          }
        />
        <Suspense fallback={<TableSkeleton />}>
          <PurchaseRecordList page={purchasePage} />
        </Suspense>
      </div>

      <div className="flex flex-col gap-6">
        <PageHeader
          title="판매 기록"
          description="전체 판매 내역입니다."
          action={
            <a href="/api/export/sales">
              <Button variant="secondary">CSV 다운로드</Button>
            </a>
          }
        />
        <Suspense fallback={<TableSkeleton />}>
          <SaleRecordList page={salePage} />
        </Suspense>
      </div>
    </div>
  );
}
