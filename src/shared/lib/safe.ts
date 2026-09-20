export type SafeResult<T> = { ok: true; data: T } | { ok: false };

export async function safely<T>(fn: () => Promise<T>): Promise<SafeResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch {
    return { ok: false };
  }
}
