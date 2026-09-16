import type { OrderTimelineItem } from "@/components/order/order-timeline/order-timeline.component";
import type { OrderStatusHistoryItem } from "@/utils/api/order/order.interface";
import { formatDate } from "@/utils/format";

function mapOrderDetailTimelineEntry(entry: OrderStatusHistoryItem, index: number): OrderTimelineItem {
  const dateObj = new Date(entry.createdAt);
  const isValidDate = !Number.isNaN(dateObj.getTime());

  return {
    id: entry.id ?? `${entry.toStatus}-${entry.createdAt}`,
    time: isValidDate ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
    date: formatDate(entry.createdAt),
    title: entry.title?.trim() || String(entry.toStatus ?? "").trim(),
    description: entry.subtitle?.trim() ?? "",
    isActive: index === 0,
  };
}

function getTimelineContentKey(item: OrderTimelineItem): string {
  return `${item.title}\0${item.description}`;
}

function dedupeConsecutiveTimelineItemsByContent(items: OrderTimelineItem[]): OrderTimelineItem[] {
  const deduped: OrderTimelineItem[] = [];
  let lastContentKey: string | null = null;

  for (const item of items) {
    const contentKey = getTimelineContentKey(item);
    if (contentKey === lastContentKey) continue;
    lastContentKey = contentKey;
    deduped.push(item);
  }

  return deduped.map((item, index) => ({
    ...item,
    isActive: index === 0,
  }));
}

export function buildOrderDetailTimelineItems(statusHistory: OrderStatusHistoryItem[] = []): OrderTimelineItem[] {
  const mapped = [...statusHistory]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((entry, index) => mapOrderDetailTimelineEntry(entry, index));

  return dedupeConsecutiveTimelineItemsByContent(mapped);
}
