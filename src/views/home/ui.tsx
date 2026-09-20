import { PageHeader } from "@/shared/ui/PageHeader";
import { StockBoard } from "@/widgets/stock-board/ui";

export function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="재고 현황"
        description="온라인 재고, 배송중 재고, 보유 재고를 한눈에 확인합니다."
      />
      <StockBoard />
    </div>
  );
}
