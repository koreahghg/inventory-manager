import { StatsPage, type StatsSearchParams } from "@/views/stats/ui";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<StatsSearchParams>;
}) {
  const params = await searchParams;
  return <StatsPage searchParams={params} />;
}
