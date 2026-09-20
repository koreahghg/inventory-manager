"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";
import { clearAttempts, isRateLimited, recordFailedAttempt } from "@/shared/lib/rate-limit";

export async function login(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    redirect("/login?error=invalid");
  }

  const rateLimitKey = email.trim().toLowerCase();

  if (isRateLimited(rateLimitKey)) {
    redirect("/login?error=rate_limited");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    recordFailedAttempt(rateLimitKey);
    redirect("/login?error=invalid");
  }

  clearAttempts(rateLimitKey);
  redirect("/");
}
