import { LoginForm } from "@/features/auth/login/ui";

export function LoginPage({ error }: { error?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-grey-50 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-grey-200 bg-white p-8 shadow-[0_12px_32px_oklch(0.155_0.060_261_/_0.10),0_2px_6px_oklch(0.155_0.060_261_/_0.06)]">
        <h1 className="mb-6 text-center text-h2 font-bold text-grey-900">
          LOGIN IMS
        </h1>
        <LoginForm error={error} />
      </div>
    </div>
  );
}
