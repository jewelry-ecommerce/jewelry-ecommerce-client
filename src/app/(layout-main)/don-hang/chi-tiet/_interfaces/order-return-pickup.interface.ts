import type { OrderDetailResponse, OrderShippingAddressSnapshot } from "@/utils/api/checkout/checkout.interface";

export interface PickupAddressValues {
  fullName: string;
  provinceCode: number;
  provinceName: string;
  wardCode: number;
  wardName: string;
  addressLine: string;
  phone: string;
}

export const INITIAL_PICKUP_ADDRESS: PickupAddressValues = {
  fullName: "",
  provinceCode: 0,
  provinceName: "",
  wardCode: 0,
  wardName: "",
  addressLine: "",
  phone: "",
};

const INVALID_LOCATION_CODE_SENTINELS = new Set([9_999, 99_999, 999_999, 999_9999]);

export function isInvalidLocationCode(code: number): boolean {
  if (!Number.isFinite(code) || code <= 0) return true;
  return INVALID_LOCATION_CODE_SENTINELS.has(Math.floor(code));
}

export function isValidProvinceCode(code: number): boolean {
  return !isInvalidLocationCode(code);
}

export function isValidWardCode(code: number): boolean {
  return !isInvalidLocationCode(code);
}

export function isPickupAddressStorable(addr: PickupAddressValues | undefined): boolean {
  if (!addr) return false;
  return isValidProvinceCode(addr.provinceCode) && isValidWardCode(addr.wardCode);
}

export function normalizePickupAddressValues(addr: PickupAddressValues): PickupAddressValues {
  return {
    ...addr,
    provinceCode: isInvalidLocationCode(addr.provinceCode) ? 0 : Math.floor(addr.provinceCode),
    wardCode: isInvalidLocationCode(addr.wardCode) ? 0 : Math.floor(addr.wardCode),
  };
}

export function pickupAddressFromOrderSnapshot(snapshot: OrderShippingAddressSnapshot): PickupAddressValues {
  const last = snapshot.lastName?.trim() ?? "";
  const first = snapshot.firstName?.trim() ?? "";
  const fullName = [last, first].filter(Boolean).join(" ").trim();

  return normalizePickupAddressValues({
    fullName,
    provinceCode: snapshot.provinceCode != null ? Number(snapshot.provinceCode) : 0,
    provinceName: snapshot.provinceName ?? "",
    wardCode: snapshot.wardCode != null ? Number(snapshot.wardCode) : 0,
    wardName: snapshot.wardName ?? "",
    addressLine: snapshot.addressLine ?? "",
    phone: snapshot.receiverPhone ?? "",
  });
}

export function pickupAddressDefaultsFromOrder(order: OrderDetailResponse): PickupAddressValues {
  return pickupAddressFromOrderSnapshot(order.shippingAddressSnapshot);
}
