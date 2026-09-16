import type { AppDispatch } from "@/redux/store";
import { syncCartFromServer } from "@/redux/slices/cart.slice";
import { CartApi } from "@/utils/api";
import { getCartSyncGeneration, isCartGetAborted } from "@/utils/api/cart/cart-sync-abort.util";
import type { CartApiResponsePost } from "./cart.interface";
import { withFreshGuestCartHeader, type CartRequestOptions, type PostCartLine } from "./cart.util";
import { attachUtmDataToCartLines } from "@/utils/utm/utm-cart.util";
import { getErrorMessage } from "@/utils/helpers/axios";

export type PersistCartLinesResult =
  | { success: true; postResponse: CartApiResponsePost }
  | { success: false; reason: "empty-lines" | "api-failed" | "sync-failed" | "error" | string; message?: string };

function isIntentionalCartSyncAbort(error: unknown): boolean {
  return isCartGetAborted(error);
}

export async function persistCartLines(
  dispatch: AppDispatch,
  lines: PostCartLine[],
  options?: CartRequestOptions,
): Promise<PersistCartLinesResult> {
  if (lines.length === 0) {
    return { success: false, reason: "empty-lines" };
  }

  try {
    const response = await CartApi.postCart({ items: attachUtmDataToCartLines(lines) }, options);

    if (!response.success) {
      return { success: false, reason: response.reason ?? "api-failed", message: response.message };
    }

    const syncResult = await dispatch(
      syncCartFromServer({
        ...withFreshGuestCartHeader(options),
        syncGeneration: getCartSyncGeneration(),
      }),
    );

    if (syncCartFromServer.rejected.match(syncResult)) {
      if (syncResult.meta.aborted || isIntentionalCartSyncAbort(syncResult.error)) {
        return { success: true, postResponse: response };
      }
      return { success: false, reason: "sync-failed" };
    }

    return { success: true, postResponse: response };
  } catch (error) {
    if (isIntentionalCartSyncAbort(error)) {
      return { success: true, postResponse: { success: true, items: [] } };
    }
    console.error("Failed to persist cart lines", error);
    return { success: false, reason: "error", message: getErrorMessage(error) };
  }
}
