import type { GtmDataLayerPayload } from "@/lib/gtm/events";
import { isCookieConsentAccepted } from "@/lib/gtm/consent";

export function pushToDataLayer(payload: GtmDataLayerPayload): void {
  if (typeof window === "undefined") {
    return;
  }

  // if (!isCookieConsentAccepted()) {
  //   return;
  // }

  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push(payload);
  } catch {
    // Tracking must never break the app.
  }
}

/** Clears persisted `ecommerce` on GTM’s merged data layer before a new ecommerce hit. */
export function resetGtmEcommerce(): void {
  pushToDataLayer({ ecommerce: null });
}

/**
 * Ecommerce hit: clear `ecommerce` cũ (chuẩn GA4) rồi push event.
 * Chỉ 1 push “trống” (`{ ecommerce: null }`) — không push thêm object `{}` để tránh GTM Preview/tag bắn nhầm.
 */
export function pushEcommerceToDataLayer(payload: GtmDataLayerPayload): void {
  resetGtmEcommerce();
  pushToDataLayer(payload);
}
