import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";
import { Sidebar } from "@/widgets/sidebar-nav/ui";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The proxy (src/proxy.ts) already redirects unauthenticated requests, but
  // it only performs an optimistic check; enforce it again here since this
  // is where the protected data actually gets fetched.
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar userEmail={user.email ?? null} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
