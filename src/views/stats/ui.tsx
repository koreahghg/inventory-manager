import { PageHeader } from "@/shared/ui/PageHeader";
import { Alert } from "@/shared/ui/Alert";
import { safely } from "@/shared/lib/safe";
import type { StatsGranularity } from "@/entities/stats/model";
import {
  getDailyBreakdown,
  getMonthlyBreakdown,
  getTransactionYearRange,
  getYearlyBreakdown,
} from "@/entities/stats/api";
import { StatsFilter } from "@/widgets/stats-filter/ui";
import { StatsTable } from "@/widgets/stats-table/ui";
import { StatsChart } from "@/widgets/stats-charts/ui";

export type StatsSearchParams = {
  granularity?: string;
  year?: string;
  month?: string;
};

export async function StatsPage({
  searchParams,
}: {
  searchParams: StatsSearchParams;
}) {
  const now = new Date();
  const granularity: StatsGranularity =
    searchParams.granularity === "year" || searchParams.granularity === "day"
      ? searchParams.granularity
      : "month";
  const year = Number(searchParams.year) || now.getFullYear();
  const month = Number(searchParams.month) || now.getMonth() + 1;

  const result = await safely(() =>
    Promise.all([
      granularity === "year"
        ? getYearlyBreakdown()
        : granularity === "month"
          ? getMonthlyBreakdown(year)
          : getDailyBreakdown(year, month),
      getTransactionYearRange(),
    ]),
  );

  if (!result.ok) {
    return (
      <Alert
        tone="warning"
        message="통계 데이터를 불러오지 못했습니다. Supabase 연결 및 마이그레이션 적용 여부를 확인해 주세요."
      />
    );
  }

  const [rows, yearRange] = result.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="통계"
        description="기간별 매입·판매·순이익 통계입니다."
        action={
          <StatsFilter
            granularity={granularity}
            year={year}
            month={month}
            minYear={yearRange?.minYear ?? now.getFullYear()}
            maxYear={yearRange?.maxYear ?? now.getFullYear()}
          />
        }
      />

      <StatsChart rows={rows} />
      <StatsTable rows={rows} />
    </div>
  );
}
