import { Suspense } from "react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { TableSkeleton } from "@/shared/ui/Skeleton";
import { safely } from "@/shared/lib/safe";
import { StockList, preload as preloadStockList } from "@/widgets/stock-list/ui";
import { ProductFilter } from "@/widgets/product-filter/ui";
import { CreatePurchaseTrigger } from "@/features/purchase/create-purchase/trigger";
import { hasLogisticsRegistration } from "@/entities/logistics-registration/api";

export type ProductsSearchParams = {
  q?: string;
  page?: string;
};

export async function ProductsPage({
  searchParams,
}: {
  searchParams: ProductsSearchParams;
}) {
  const q = searchParams.q ?? "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  preloadStockList(page, q);

  const registrationCheck = await safely(() => hasLogisticsRegistration());

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="재고 관리"
        description="재고가 남은 매입 건을 상태 변경, 판매 처리, 삭제할 수 있습니다. 전체 이력은 기록 페이지에서 확인하세요."
        action={
          <CreatePurchaseTrigger
            hasLogisticsRegistration={registrationCheck.ok ? registrationCheck.data : false}
          />
        }
      />
      <ProductFilter q={q} />
      <Suspense fallback={<TableSkeleton />}>
        <StockList page={page} q={q} />
      </Suspense>
    </div>
  );
}
