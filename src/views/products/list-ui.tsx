import { Suspense } from "react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { TableSkeleton } from "@/shared/ui/Skeleton";
import { safely } from "@/shared/lib/safe";
import { ProductList, preload as preloadProductList } from "@/widgets/product-list/ui";
import { ProductFilter } from "@/widgets/product-filter/ui";
import { PurchaseList, preload as preloadPurchaseList } from "@/widgets/purchase-list/ui";
import { SaleList, preload as preloadSaleList } from "@/widgets/sale-list/ui";
import { CreatePurchaseTrigger } from "@/features/purchase/create-purchase/trigger";
import type { ProductListFilter } from "@/entities/product/api";
import { hasLogisticsRegistration } from "@/entities/logistics-registration/api";

export type ProductsSearchParams = {
  q?: string;
  purchasePage?: string;
  salePage?: string;
};

export async function ProductsPage({
  searchParams,
}: {
  searchParams: ProductsSearchParams;
}) {
  const q = searchParams.q ?? "";
  const purchasePage = Math.max(1, Number(searchParams.purchasePage) || 1);
  const salePage = Math.max(1, Number(searchParams.salePage) || 1);
  const filter: ProductListFilter = { q, stock: "in_stock" };

  // Fire every section's data fetch immediately instead of waiting for
  // productOptions/registrationCheck to resolve first; React.cache() lets
  // ProductList/PurchaseList/SaleList below reuse these in-flight requests.
  preloadProductList(filter);
  preloadPurchaseList(purchasePage);
  preloadSaleList(salePage);

  const registrationCheck = await safely(() => hasLogisticsRegistration());

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="재고 관리"
          description="등록된 상품과 현재 재고 현황입니다."
          action={
            <CreatePurchaseTrigger
              hasLogisticsRegistration={registrationCheck.ok ? registrationCheck.data : false}
            />
          }
        />
        <ProductFilter q={q} />
        <Suspense fallback={<TableSkeleton />}>
          <ProductList filter={filter} />
        </Suspense>
      </div>

      <div className="flex flex-col gap-6">
        <PageHeader
          title="매입 관리"
          description="재고가 남은 매입 건만 표시됩니다. 전체 매입 이력은 기록 페이지에서 확인하세요."
        />
        <Suspense fallback={<TableSkeleton />}>
          <PurchaseList page={purchasePage} />
        </Suspense>
      </div>

      <div className="flex flex-col gap-6">
        <PageHeader
          title="판매 내역"
          description="취소 가능한 판매 건만 표시됩니다. 전체 판매 이력은 기록 페이지에서 확인하세요."
        />
        <Suspense fallback={<TableSkeleton />}>
          <SaleList page={salePage} />
        </Suspense>
      </div>
    </div>
  );
}
