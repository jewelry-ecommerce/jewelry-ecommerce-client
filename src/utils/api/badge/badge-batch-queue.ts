import type { AppDispatch } from "@/redux/store";
import { fetchStorefrontBadgesBatch } from "@/redux/slices/badge.slice";
import type { ProductBadgesByVariants } from "./badge.interface";
import type { StorefrontProductInput } from "./badge.interface";

const pendingByProductId = new Map<string, StorefrontProductInput>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

// Track products that have already been dispatched to avoid duplicate requests
// while the API call is still pending (Redux state not yet updated) or double-effects.
const requestedProductIds = new Set<string>();

const mergePending = (products: StorefrontProductInput[]) => {
  for (const product of products) {
    pendingByProductId.set(product.productId, product);
  }
};

const filterProductsNeedingFetch = (batch: StorefrontProductInput[], loadedByProductId: Record<string, ProductBadgesByVariants>) =>
  batch.filter((product) => {
    if (loadedByProductId[product.productId]) return false;
    if (requestedProductIds.has(product.productId)) return false;
    return true;
  });

/** Gộp request batch; chỉ fetch SP chưa có badge trong Redux (tránh skip nhầm khi đổi trang). */
export const queueStorefrontBadgesFetch = (
  dispatch: AppDispatch,
  products: StorefrontProductInput[],
  loadedByProductId: Record<string, ProductBadgesByVariants> = {},
) => {
  if (products.length === 0) return;

  mergePending(products);

  if (flushTimer) {
    clearTimeout(flushTimer);
  }

  flushTimer = setTimeout(() => {
    flushTimer = null;
    const batch = [...pendingByProductId.values()];
    pendingByProductId.clear();

    const toFetch = filterProductsNeedingFetch(batch, loadedByProductId);
    if (toFetch.length === 0) return;

    for (const product of toFetch) {
      requestedProductIds.add(product.productId);
    }

    void dispatch(fetchStorefrontBadgesBatch(toFetch)).finally(() => {
      // Remove from requested set after API call is fully resolved (success or error).
      // If success, they are now in Redux loadedByProductId.
      // If fail, they are removed from Set so they can be retried next time.
      for (const product of toFetch) {
        requestedProductIds.delete(product.productId);
      }
    });
  }, 0);
};
