import { EmptyState } from "@/shared/ui/EmptyState";
import { Alert } from "@/shared/ui/Alert";
import { safely } from "@/shared/lib/safe";
import { listPurchasesByProduct } from "@/entities/purchase/api";
import { PurchaseHistoryTable } from "./table";

export function preload(productId: string) {
  void listPurchasesByProduct(productId);
}

export async function PurchaseHistory({ productId }: { productId: string }) {
  const result = await safely(() => listPurchasesByProduct(productId));

  if (!result.ok) {
    return (
      <Alert tone="warning" message="매입 이력을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." />
    );
  }

  const purchases = result.data;

  if (purchases.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-title-2 font-bold text-grey-900">매입 이력</h2>
        <EmptyState message="매입 이력이 없습니다." />
      </div>
    );
  }

  return <PurchaseHistoryTable productId={productId} purchases={purchases} />;
}
