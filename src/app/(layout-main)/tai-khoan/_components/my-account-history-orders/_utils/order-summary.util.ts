import type { OrderListSummary } from "@/utils/api/checkout/checkout.interface";

export function areOrderSummariesEqual(a: OrderListSummary, b: OrderListSummary): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of keys) {
    if ((a[key] ?? 0) !== (b[key] ?? 0)) return false;
  }

  return true;
}
