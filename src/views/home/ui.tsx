import { PageHeader } from "@/shared/ui/PageHeader";
import { Button } from "@/shared/ui/Button";
import { StockBoard } from "@/widgets/stock-board/ui";
import { DashboardTotals } from "@/widgets/dashboard-totals/ui";

export function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="재고 현황"
        description="온라인 재고, 배송중 재고, 보유 재고를 한눈에 확인합니다."
        action={
          <a href="/api/export/stock">
            <Button variant="secondary">엑셀 다운로드</Button>
          </a>
        }
      />
      <DashboardTotals />
      <StockBoard />
    </div>
  );
}
