import { authAxios } from "@/utils/axios";
import { currentJavaOwner } from "./java-checkout.storage";
import type { GetOrdersMeParams, OrderListResponse, OrderDetailResponse, OrderStatusByOrderCodeResponse } from "../order/order.interface";
import { javaOrderView, javaOrderListItem } from "./java-order.mapper";
import { JAVA_CHECKOUT_POLICY, type JavaPage, type JavaOrder } from "./java-commerce.types";

export async function javaOrders(params: GetOrdersMeParams = {}): Promise<OrderListResponse> {
  const orders: JavaOrder[] = [];
  let page = 1;
  while (true) {
    const result = (await authAxios.get<JavaPage<JavaOrder>>("storefront/order", { params: { page, take: JAVA_CHECKOUT_POLICY.pageTake } })).data;
    orders.push(...result.list);
    if (!result.pagination.hasNextPage) break;
    page += 1;
  }
  const rows = orders.map(javaOrderListItem);
  const summary: OrderListResponse["summary"] = { ALL: rows.length };
  for (const row of rows) summary[row.status] = (summary[row.status] ?? 0) + 1;
  const filtered = rows.filter(row => (!params.status || String(row.status) === String(params.status))
    && (!params.search || row.orderCode.toLowerCase().includes(params.search.toLowerCase())));
  if (params.fulfillmentType === "PRE_ORDER") throw new Error("Đơn đặt trước dùng API riêng, không thuộc danh sách đơn thường.");
  const take = params.take ?? 20, offset = ((params.page ?? 1) - 1) * take;
  return { total: filtered.length, list: filtered.slice(offset, offset + take), summary };
}
export async function javaOrderDetail(code: string): Promise<OrderDetailResponse> {
  return javaOrderView((await authAxios.get<JavaOrder>("storefront/order/" + encodeURIComponent(code))).data);
}
export async function javaGuestOrder(code: string, phone: string): Promise<OrderDetailResponse> {
  return javaOrderView((await authAxios.get<JavaOrder>("storefront/order/guest/" + encodeURIComponent(code), { params: { phone } })).data);
}
export async function javaOrderPaymentStatus(code: string): Promise<OrderStatusByOrderCodeResponse> {
  const latest = typeof window === "undefined" ? null : window.sessionStorage.getItem("latest_order");
  const snapshot: unknown = latest ? JSON.parse(latest) : null;
  const owner = await currentJavaOwner();
  const isGuestSnapshot = !owner && snapshot !== null && typeof snapshot === "object"
    && "orderCode" in snapshot && snapshot.orderCode === code && "phone" in snapshot && typeof snapshot.phone === "string";
  const order = isGuestSnapshot ? await javaGuestOrder(code, String(snapshot.phone)) : await javaOrderDetail(code);
  return { orderCode: code, orderStatus: order.status, paymentStatus: order.paymentStatus, paymentMethod: order.paymentMethod,
    grandTotal: order.grandTotal, orderExpiresAt: null, orderRemainingSeconds: null, paymentLink: null,
    paymentLinkExpiresAt: null, paymentLinkStatus: null, displayState: order.status };
}
