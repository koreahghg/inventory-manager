import { Alert } from "@/shared/ui/Alert";
import { formatCurrency } from "@/shared/lib/format";
import { safely } from "@/shared/lib/safe";
import { getDashboardTotals } from "@/entities/stats/api";

export async function DashboardTotals() {
  const result = await safely(() => getDashboardTotals());

  if (!result.ok) {
    return (
      <Alert tone="warning" message="전체 요약을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." />
    );
  }

  const totals = result.data;

  return (
    <div className="flex flex-wrap gap-6 text-body-2 text-grey-600">
      <p>
        총 매입금액{" "}
        <span className="font-bold tabular-nums text-grey-900">
          {formatCurrency(totals.total_purchase_amount)}
        </span>
      </p>
      <p>
        총 판매금액{" "}
        <span className="font-bold tabular-nums text-grey-900">
          {formatCurrency(totals.total_sale_amount)}
        </span>
      </p>
      <p>
        총 수익{" "}
        <span className="font-bold tabular-nums text-grey-900">
          {formatCurrency(totals.total_net_profit)}
        </span>
      </p>
    </div>
  );
}
