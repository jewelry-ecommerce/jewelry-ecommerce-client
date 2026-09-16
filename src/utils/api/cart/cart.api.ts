import { authAxios } from "@/utils/axios";
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

function normalizeGetCartResponse(data: unknown): CartApiResponse {
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object" && "items" in data) {
    const envelope = data as CartApiResponsePost;
    persistGuestCartIdFromResponse(envelope);
    return envelope.items ?? [];
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

export const postCart = async (paramPostCartItem: ParamPostCartItem, options?: PostCartOptions): Promise<CartApiResponsePost> => {
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
