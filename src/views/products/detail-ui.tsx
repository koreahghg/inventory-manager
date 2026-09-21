import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Alert } from "@/shared/ui/Alert";
import { TableSkeleton } from "@/shared/ui/Skeleton";
import { formatCurrency, formatQuantity } from "@/shared/lib/format";
import { daysSince, isStaleInventory } from "@/shared/lib/stale";
import { safely } from "@/shared/lib/safe";
import { getProduct, getProductStock } from "@/entities/product/api";
import { ProductGallery } from "@/widgets/product-gallery/ui";
import { PurchaseHistory, preload as preloadPurchaseHistory } from "@/widgets/purchase-history/ui";
import { SaleHistory, preload as preloadSaleHistory } from "@/widgets/sale-history/ui";

export async function ProductDetailPage({ productId }: { productId: string }) {
  // Start these alongside the fetches below instead of waiting for them to
  // finish first; React.cache() lets the widgets below reuse this same
  // in-flight request instead of firing it again.
  preloadPurchaseHistory(productId);
  preloadSaleHistory(productId);

  const productResult = await safely(() => getProduct(productId));
  if (!productResult.ok) {
    return (
      <Alert
        tone="warning"
        message="상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
      />
    );
  }

  const product = productResult.data;
  if (!product) notFound();

  const result = await safely(() => getProductStock(productId));

  if (!result.ok) {
    return (
      <Alert
        tone="warning"
        message="상품 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
      />
    );
  }

  const stock = result.data;
  const stale = isStaleInventory(stock.oldest_available_purchase_date);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={product.name}
        description={[product.brand, product.style_code, product.size, product.color]
          .filter(Boolean)
          .join(" · ")}
        action={
          <div className="flex items-center gap-2">
            {stock.remaining_quantity > 0 ? (
              <Badge tone="green">재고 {formatQuantity(stock.remaining_quantity)}</Badge>
            ) : (
              <Badge tone="gray">품절</Badge>
            )}
            {stale && <Badge tone="red">장기재고 {daysSince(stock.oldest_available_purchase_date!)}일</Badge>}
          </div>
        }
      />

      <Card>
        <h2 className="mb-3 text-title-2 font-bold text-grey-900">이미지</h2>
        <ProductGallery imageUrl={product.image_url} productName={product.name} productId={productId} />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatBox label="누적 매입 수량" value={formatQuantity(stock.purchased_quantity)} />
        <StatBox label="누적 판매 수량" value={formatQuantity(stock.sold_quantity)} />
        <StatBox label="현재 재고 수량" value={formatQuantity(stock.remaining_quantity)} />
        <StatBox label="현재 재고 매입금액" value={formatCurrency(stock.remaining_cost)} />
      </div>

      {product.memo && (
        <Card>
          <h2 className="mb-2 text-title-2 font-bold text-grey-900">메모</h2>
          <p className="text-body-2 text-grey-600">{product.memo}</p>
        </Card>
      )}

      <div>
        <Suspense fallback={<TableSkeleton />}>
          <PurchaseHistory productId={productId} />
        </Suspense>
      </div>

      <div>
        <h2 className="mb-2 text-title-2 font-bold text-grey-900">판매 이력</h2>
        <Suspense fallback={<TableSkeleton />}>
          <SaleHistory productId={productId} />
        </Suspense>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-caption text-grey-500">{label}</p>
      <p className="mt-1 text-title-1 font-bold tabular-nums text-grey-900">{value}</p>
    </Card>
  );
}
