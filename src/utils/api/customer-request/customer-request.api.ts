import { commonAxios } from "@/utils/axios";
import type { BackInStockRequest, NewsletterRequest, OrderSupportRequest } from "./customer-request.interface";

const CUSTOMER_REQUEST_BASE = "order/customer-requests";

export const postBackInStockRequest = async (payload: BackInStockRequest): Promise<void> => {
  await commonAxios.post(`${CUSTOMER_REQUEST_BASE}/back-in-stock`, payload);
};

export const postOrderSupportRequest = async (payload: OrderSupportRequest): Promise<void> => {
  await commonAxios.post(`${CUSTOMER_REQUEST_BASE}/order-support`, payload);
};

export const postNewsletterRequest = async (payload: NewsletterRequest): Promise<void> => {
  await commonAxios.post(`${CUSTOMER_REQUEST_BASE}/newsletter`, payload);
};
