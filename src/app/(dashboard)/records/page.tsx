import { RecordsPage, type RecordsSearchParams } from "@/views/records/ui";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<RecordsSearchParams>;
}) {
  const params = await searchParams;
  return <RecordsPage searchParams={params} />;
}
