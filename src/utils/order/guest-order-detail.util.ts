import type { GuestOrderDetailResponse, OrderDetailResponse } from "@/utils/api/order/order.interface";
import { OrderSource } from "@/utils/api/order/order.enum";

export const guestOrderDetailToViewOrder = (order: GuestOrderDetailResponse): OrderDetailResponse => ({
  ...order,
  id: "",
  customerId: "",
  source: OrderSource.WEBSITE,
  contactEmail: null,
  errorLog: null,
  shippingAddressSnapshot: order.shippingAddressSnapshot ?? {
    firstName: "",
    lastName: "",
    receiverPhone: "",
    addressLine: "",
    wardCode: null,
    wardName: "",
    provinceCode: null,
    provinceName: "",
  },
  items: order.items.map((item) => ({ ...item, id: "" })),
  statusHistory: order.statusHistory.map((item) => ({
    ...item,
    changedById: null,
    changedByType: null,
  })),
});
