import { Card } from "./Card";

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-caption text-grey-500">{label}</p>
      <p className="mt-1 text-title-1 font-bold tabular-nums text-grey-900">
        {value}
      </p>
    </Card>
  );
}
