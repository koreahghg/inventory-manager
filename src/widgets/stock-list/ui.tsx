import { EmptyState } from "@/shared/ui/EmptyState";
import { Alert } from "@/shared/ui/Alert";
import { Pagination } from "@/shared/ui/Pagination";
import { safely } from "@/shared/lib/safe";
import { listActiveStock } from "@/entities/purchase/api";
import { StockGroupTable } from "./table";

export function preload(page: number, q?: string) {
  void listActiveStock(page, q);
}

export async function StockList({ page, q }: { page: number; q?: string }) {
  const result = await safely(() => listActiveStock(page, q));

  if (!result.ok) {
    return (
      <Alert tone="warning" message="재고 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." />
    );
  }

  const { rows: groups, totalPages } = result.data;

  if (groups.length === 0) {
    return <EmptyState message="조건에 맞는 재고가 없습니다." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <StockGroupTable groups={groups} />
      <Pagination page={page} totalPages={totalPages} paramName="page" />
    </div>
  );
}
