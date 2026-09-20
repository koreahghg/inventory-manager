export const STALE_INVENTORY_DAYS = 60;

export function daysSince(dateStr: string): number {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function isStaleInventory(oldestAvailablePurchaseDate: string | null): boolean {
  if (!oldestAvailablePurchaseDate) return false;
  return daysSince(oldestAvailablePurchaseDate) >= STALE_INVENTORY_DAYS;
}
