import { cache } from "react";
import { createClient } from "@/shared/lib/supabase/server";
import type { LogisticsRegistration } from "./model";

/** Gate: purchasing is blocked until at least one registration exists. */
export const hasLogisticsRegistration = cache(async function hasLogisticsRegistration(): Promise<boolean> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("logistics_registrations")
    .select("id", { count: "exact", head: true });

  if (error) throw error;
  return (count ?? 0) > 0;
});

export const listLogisticsRegistrations = cache(
  async function listLogisticsRegistrations(): Promise<LogisticsRegistration[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("logistics_registrations")
      .select("*")
      .order("registered_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as LogisticsRegistration[];
  },
);
