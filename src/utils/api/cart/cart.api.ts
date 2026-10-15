import { authAxios } from "@/utils/axios";
import { isJavaBackend } from "@/utils/config/java-backend.config";
import {
  CartApiResponse,
  CartApiResponsePost,
  CartCalculateTotalResponse,
  CartRecommendationParams,
  CartRecommendationResponse,
  ParamCalculateTotal,
  ParamPostCartItem,
} from "./cart.interface";
import { withFreshGuestCartHeader, type CartRequestOptions } from "./cart.util";
import { clearGuestCartId, getGuestCartId, setGuestCartId } from "./guest-cart-id.util";

function persistGuestCartIdFromResponse(data: CartApiResponsePost) {
  if (data.guestId) setGuestCartId(data.guestId);
}

function cartViewIds<T extends CartApiResponse[number]>(items: T[]): T[] {
  if (!isJavaBackend()) return items;
  return items.map(item => "variationId" in item && item.variationId
    ? { ...item, id: String(item.variationId), variationId: String(item.variationId) } : item);
}

function normalizeGetCartResponse(data: unknown): CartApiResponse {
  if (Array.isArray(data)) return cartViewIds(data);

  if (data && typeof data === "object" && "items" in data) {
    const envelope = data as CartApiResponsePost;
    persistGuestCartIdFromResponse(envelope);
    return cartViewIds(envelope.items ?? []);
  }

  return [];
}

async function retryWhenGuestCartForbidden<T>(
  request: (opts?: CartRequestOptions) => Promise<T>,
  options?: CartRequestOptions,
): Promise<T> {
  try {
    return await request(options);
  } catch (error) {
    const axiosError = error as { response?: { status?: number } };
    const status = axiosError?.response?.status;

    if (status === 403 && getGuestCartId()) {
      clearGuestCartId();
      return request({ ...options, headers: { ...options?.headers } });
    }

    throw error;
  }
}

export const getCart = async (options?: CartRequestOptions): Promise<CartApiResponse> => {
  const { signal, ...restOptions } = options ?? {};
  const data = await retryWhenGuestCartForbidden(async (resolvedOptions) => {
    const result = await authAxios.get("cart/cart", {
      ...withFreshGuestCartHeader(resolvedOptions ?? {}),
      signal,
      params: { grouped: true }, // set term
    });
    return result.data;
  }, restOptions);

  return normalizeGetCartResponse(data);
};

type PostCartOptions = CartRequestOptions;

async function javaSetCart(params: ParamPostCartItem, options?: CartRequestOptions): Promise<CartApiResponsePost> {
  if (params.items.some(line => !line.variationId || line.setId || line.setComponents?.length || line.selectedPackagingRelationIds?.length))
    throw new Error("Java chưa hỗ trợ bộ sản phẩm hoặc bao bì trong giỏ hàng.");
  let result: CartApiResponsePost;
  if (params.clearAll) {
    result = (await authAxios.post("cart/cart", { clearAll: true, items: [] }, withFreshGuestCartHeader(options ?? {}))).data;
    persistGuestCartIdFromResponse(result);
  }
  for (const line of params.items) {
    result = (await authAxios.put("cart/cart", { variationId: line.variationId, quantity: line.quantity },
      withFreshGuestCartHeader(options ?? {}))).data;
    persistGuestCartIdFromResponse(result);
  }
  const response:CartApiResponsePost=(await authAxios.get("cart/cart", withFreshGuestCartHeader(options ?? {}))).data;
  return {...response,items:cartViewIds(response.items??[])};
}

export const postCart = async (paramPostCartItem: ParamPostCartItem, options?: PostCartOptions): Promise<CartApiResponsePost> => {
  if (isJavaBackend()) return retryWhenGuestCartForbidden(resolved => javaSetCart(paramPostCartItem, resolved), options);
  const data = await retryWhenGuestCartForbidden(async (resolvedOptions) => {
    const result = await authAxios.post("cart/cart", paramPostCartItem, withFreshGuestCartHeader(resolvedOptions ?? {}));
    persistGuestCartIdFromResponse(result.data);
    return result.data;
  }, options);

  return data;
};

export const mergeCart = async (options?: CartRequestOptions): Promise<CartApiResponsePost> => {
  const data = await retryWhenGuestCartForbidden(async (resolvedOptions) => {
    const result = await authAxios.post("cart/cart/merge", {}, withFreshGuestCartHeader(resolvedOptions ?? {}));
    persistGuestCartIdFromResponse(result.data);
    return result.data;
  }, options);

  return data;
};

export const calculateCartTotal = async (params: ParamCalculateTotal, options?: CartRequestOptions): Promise<CartCalculateTotalResponse> =>
  (await authAxios.post("cart/cart/calculate-total", params, withFreshGuestCartHeader(options ?? {}))).data;

export const getCartRecommendations = async (
  options?: CartRequestOptions,
  params: CartRecommendationParams = {},
): Promise<CartRecommendationResponse> =>
  (
    await authAxios.get("cart/cart/recommendation", {
      ...withFreshGuestCartHeader(options ?? {}),
      params: {
        page: params.page ?? 1,
        take: params.take ?? 10,
      },
    })
  ).data;
