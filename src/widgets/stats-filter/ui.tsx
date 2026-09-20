"use client";

import { useRouter, usePathname } from "next/navigation";
import { Select } from "@/shared/ui/Select";
import type { StatsGranularity } from "@/entities/stats/model";

const GRANULARITY_LABELS: Record<StatsGranularity, string> = {
  year: "연도별",
  month: "월별",
  day: "일별",
};

export function StatsFilter({
  granularity,
  year,
  month,
  minYear,
  maxYear,
}: {
  granularity: StatsGranularity;
  year: number;
  month: number;
  minYear: number;
  maxYear: number;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(next: Partial<Record<"granularity" | "year" | "month", string>>) {
    const params = new URLSearchParams({
      granularity,
      year: String(year),
      month: String(month),
      ...next,
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  const years = Array.from(
    { length: Math.max(1, maxYear - minYear + 1) },
    (_, i) => maxYear - i,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={granularity}
        onChange={(e) => navigate({ granularity: e.target.value })}
      >
        {(Object.keys(GRANULARITY_LABELS) as StatsGranularity[]).map((g) => (
          <option key={g} value={g}>
            {GRANULARITY_LABELS[g]}
          </option>
        ))}
      </Select>

      {(granularity === "month" || granularity === "day") && (
        <Select value={year} onChange={(e) => navigate({ year: e.target.value })}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </Select>
      )}

      {granularity === "day" && (
        <Select value={month} onChange={(e) => navigate({ month: e.target.value })}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}월
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}
