import { LoginPage } from "@/views/login/ui";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <LoginPage error={error} />;
}
