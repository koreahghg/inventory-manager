"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/shared/lib/format";
import type { BreakdownRow } from "@/entities/stats/model";

export function StatsChart({ rows }: { rows: BreakdownRow[] }) {
  const chronological = [...rows].sort((a, b) => a.key.localeCompare(b.key));

  return (
    <div className="h-72 w-full rounded-xl border border-grey-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chronological} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value: number) =>
              value >= 10000 ? `${Math.round(value / 10000)}만` : String(value)
            }
          />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend />
          <Bar dataKey="purchaseAmount" name="매입금액" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          <Bar dataKey="saleAmount" name="판매금액" fill="#1f2937" radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="netProfit"
            name="순이익"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
