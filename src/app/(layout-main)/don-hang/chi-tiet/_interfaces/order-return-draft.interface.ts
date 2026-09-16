import type { OrderReturnReason } from "@/utils/api/order/order.enum";
import type { OrderProductItemData } from "./order-product-item.interface";
import type { PickupAddressValues } from "./order-return-pickup.interface";

export const ORDER_RETURN_DRAFT_VERSION = 1 as const;
export const ORDER_RETURN_DRAFT_MAX_AGE_MS = 30 * 60 * 1000;
export const ORDER_RETURN_DRAFT_MAX_EVIDENCE = 3;

export type OrderReturnDraftFlow = "exchange" | "refund";

export interface OrderReturnDraftSnapshot {
  version: typeof ORDER_RETURN_DRAFT_VERSION;
  flow: OrderReturnDraftFlow;
  orderCode: string;
  source: string | null;
  trackingPhone: string | null;
  currentStep: number;
  selectedItemIds: string[];
  returnQuantities: Record<string, number>;
  replacementProducts?: OrderProductItemData[];
  replacementQuantities?: Record<string, number>;
  selectedReason?: OrderReturnReason | "";
  note?: string;
  pickupAddress?: PickupAddressValues;
  evidenceUrls?: string[];
  updatedAt: number;
}

export interface OrderReturnDraftHydration {
  currentStep: number;
  selectedItemIds: string[];
  returnQuantities: Record<string, number>;
  replacementProducts: OrderProductItemData[];
  replacementQuantities: Record<string, number>;
  selectedReason: OrderReturnReason | "";
  note: string;
  pickupAddress?: PickupAddressValues;
  evidenceUrls: string[];
}
