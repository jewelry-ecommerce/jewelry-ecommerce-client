import { ProductLifecycleStatus, ProductPurchaseActionCode, ProductStockStatus } from "@/utils/api/product/product.enum";
import type { IProductVariation, ProductPurchaseAction } from "@/utils/api/product/product.interface";
import { toVietnamDisplayDate } from "@/utils/format";

export function resolvePurchaseAction(params: {
  purchaseAction?: ProductPurchaseAction | null;
  stockStatus?: string | null;
  productStatus?: string | null;
  isDiscontinued?: boolean;
  preOrderCampaignId?: string | null;
}): ProductPurchaseAction {
  if (params.purchaseAction?.code && params.purchaseAction.label) {
    return {
      code: params.purchaseAction.code,
      label: params.purchaseAction.label,
      enabled: params.purchaseAction.enabled !== false,
    };
  }

  const isDiscontinued = params.isDiscontinued === true || params.productStatus === ProductLifecycleStatus.DISCONTINUED;

  if (isDiscontinued) {
    return {
      code: ProductPurchaseActionCode.DISABLED,
      label: "Ngừng kinh doanh",
      enabled: false,
    };
  }

  if (hasActivePreOrderCampaign(params.preOrderCampaignId)) {
    return {
      code: ProductPurchaseActionCode.PRE_ORDER,
      label: "Đặt trước",
      enabled: true,
    };
  }

  if (params.stockStatus === ProductStockStatus.OUT_OF_STOCK) {
    return {
      code: ProductPurchaseActionCode.NOTIFY_ME,
      label: "Liên hệ khi có hàng",
      enabled: true,
    };
  }

  return {
    code: ProductPurchaseActionCode.BUY_NOW,
    label: "Mua ngay",
    enabled: true,
  };
}

export function canAddToCartFromPurchaseAction(action: ProductPurchaseAction): boolean {
  return action.enabled && (action.code === ProductPurchaseActionCode.BUY_NOW || action.code === ProductPurchaseActionCode.PRE_ORDER);
}

export function isPreOrderPurchaseAction(action?: Pick<ProductPurchaseAction, "code"> | null): boolean {
  return action?.code === ProductPurchaseActionCode.PRE_ORDER;
}

export function hasActivePreOrderCampaign(preOrderCampaignId?: string | null): boolean {
  return Boolean(preOrderCampaignId?.trim());
}

export function isNotifyPurchaseAction(action: ProductPurchaseAction): boolean {
  return action.code === ProductPurchaseActionCode.NOTIFY_ME;
}

export function isBuyOrPreOrderPurchaseAction(action: ProductPurchaseAction): boolean {
  return action.code === ProductPurchaseActionCode.BUY_NOW || action.code === ProductPurchaseActionCode.PRE_ORDER;
}

type ProductExpectedStockSource = Pick<IProductVariation, "expectedStockAt" | "preOrder">;

/** ISO / DD/MM từ variation PDP → ngày lịch VN. */
export function resolveProductExpectedStockDate(
  variation?: ProductExpectedStockSource | null,
  fallback?: ProductExpectedStockSource | null,
): string {
  const raw =
    variation?.expectedStockAt ?? variation?.preOrder?.expectedStockAt ?? fallback?.expectedStockAt ?? fallback?.preOrder?.expectedStockAt;
  return toVietnamDisplayDate(raw);
}
