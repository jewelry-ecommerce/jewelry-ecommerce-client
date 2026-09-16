import { useAppSelector } from "@/redux/hooks";
import { selectCartItems } from "@/redux/slices/cart.slice";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import {
  buildCheckoutItemsPayload,
  type CartCheckoutMode,
  getCheckoutItemsFromCart,
  getCheckoutScopeCount,
} from "@/utils/api/cart/cart-checkout.util";
import {
  filterCartItemsByFulfillmentGroup,
  hasMixedRetailAndPreOrder,
  MIXED_RETAIL_PREORDER_MESSAGE,
  type CartFulfillmentGroup,
} from "@/utils/api/cart/cart-availability.util";
import { initiateCheckout } from "@/utils/api/checkout/checkout.api";
import { getErrorMessage } from "@/utils/helpers/axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

export type { CartCheckoutMode };
export type { CartFulfillmentGroup };

export type InitiateCartCheckoutParams = {
  items: CartViewItem[];
  scopeItemCount: number;
  onBeforeNavigate?: () => void;
};

export type InitiateCheckoutFromCartParams = {
  mode: CartCheckoutMode;
  /** Khi chọn từ popup mix: chỉ checkout nhóm tương ứng. */
  fulfillmentGroup?: CartFulfillmentGroup;
  onBeforeNavigate?: () => void;
};

export type InitiateCartCheckoutResult =
  { success: true } | { success: false; reason: "empty-scope" | "no-eligible" | "mixed-fulfillment" | "error" };

const CHECKOUT_NO_ELIGIBLE_MESSAGE = "Giỏ hàng chỉ có sản phẩm hết hàng. Vui lòng bỏ chọn hoặc xóa sản phẩm hết hàng trước khi thanh toán.";

const useCartCheckout = () => {
  const router = useRouter();
  const cartItems = useAppSelector(selectCartItems);
  const [isInitiatingCheckout, setIsInitiatingCheckout] = useState(false);

  const initiateCartCheckout = useCallback(
    async ({ items, scopeItemCount, onBeforeNavigate }: InitiateCartCheckoutParams): Promise<InitiateCartCheckoutResult> => {
      if (scopeItemCount === 0) {
        return { success: false, reason: "empty-scope" };
      }

      if (items.length === 0) {
        toast.warning(CHECKOUT_NO_ELIGIBLE_MESSAGE);
        return { success: false, reason: "no-eligible" };
      }

      if (hasMixedRetailAndPreOrder(items)) {
        toast.warning(MIXED_RETAIL_PREORDER_MESSAGE);
        return { success: false, reason: "mixed-fulfillment" };
      }

      if (items.length < scopeItemCount) {
        toast.info("Một số sản phẩm hết hàng đã được tự động bỏ qua khi thanh toán.");
      }

      try {
        setIsInitiatingCheckout(true);
        const res = await initiateCheckout({ items: buildCheckoutItemsPayload(items) });
        const checkoutSessionId = res.checkoutSessionId ?? "";
        onBeforeNavigate?.();
        router.push(`/thanh-toan?sessionId=${checkoutSessionId}`);
        return { success: true };
      } catch (error) {
        console.error("Failed to initiate checkout", error);
        toast.error(getErrorMessage(error) || "Không thể tạo phiên thanh toán. Vui lòng thử lại.");
        return { success: false, reason: "error" };
      } finally {
        setIsInitiatingCheckout(false);
      }
    },
    [router],
  );

  const initiateCheckoutFromCart = useCallback(
    async ({ mode, fulfillmentGroup, onBeforeNavigate }: InitiateCheckoutFromCartParams): Promise<InitiateCartCheckoutResult> => {
      const scopeCount = getCheckoutScopeCount(cartItems, mode);
      if (mode === "selected-eligible" && scopeCount === 0) {
        return { success: false, reason: "empty-scope" };
      }

      let checkoutItems = getCheckoutItemsFromCart(cartItems, mode);
      if (fulfillmentGroup) {
        checkoutItems = filterCartItemsByFulfillmentGroup(checkoutItems, fulfillmentGroup);
      }

      if (checkoutItems.length === 0) {
        toast.warning(CHECKOUT_NO_ELIGIBLE_MESSAGE);
        return { success: false, reason: "no-eligible" };
      }

      return initiateCartCheckout({
        items: checkoutItems,
        scopeItemCount: fulfillmentGroup ? checkoutItems.length : mode === "all-eligible" ? cartItems.length : scopeCount,
        onBeforeNavigate,
      });
    },
    [cartItems, initiateCartCheckout],
  );

  return { initiateCartCheckout, initiateCheckoutFromCart, isInitiatingCheckout };
};

export default useCartCheckout;
