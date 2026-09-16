import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import useDebounce from "@/hooks/use-debounce";
import { getErrorMessage } from "@/utils/helpers/axios";
import { CheckoutApi } from "@/utils/api";
import {
  CheckoutSession,
  CheckoutSessionItem,
  GhnFeeCalculateRequest,
  IOrderShippingServiceItem,
  NearestWarehouseResponse,
  IGhnFeeCalculateResponse,
  ShippingAddress,
} from "@/utils/api/checkout/checkout.interface";
import { flattenCheckoutSessionItems } from "@/utils/api/checkout/checkout.util";
import { GhnFeeCalculateItem } from "@/utils/api/order";

const CHECKOUT_SHIPPING_SHOP_ID = 200011;
const DEFAULT_PKG_DIM_CM = 10;
const MIN_WEIGHT_G = 100;

const variationIdToNumericId = (variationId: string, index: number): number => {
  if (/^\d+$/.test(variationId)) return Number(variationId);
  let h = 0;
  for (let i = 0; i < variationId.length; i++) h = (h * 31 + variationId.charCodeAt(i)) >>> 0;
  return h || index + 1;
};

const aggregatePackageFromLineItems = (lineItems: CheckoutSessionItem[]) => {
  if (lineItems.length === 0) {
    return {
      length: DEFAULT_PKG_DIM_CM,
      width: DEFAULT_PKG_DIM_CM,
      height: DEFAULT_PKG_DIM_CM,
      weight: MIN_WEIGHT_G,
    };
  }
  const lengths = lineItems.map((it) => Number(it.lengthCm || 0));
  const widths = lineItems.map((it) => Number(it.widthCm || 0));
  const heights = lineItems.map((it) => Number(it.heightCm || 0));
  const maxOrDefault = (vals: number[]) => {
    const m = Math.max(0, ...vals);
    return m > 0 ? m : DEFAULT_PKG_DIM_CM;
  };
  const totalWeight = lineItems.reduce((acc, it) => acc + Number(it.weightGram || 0) * Number(it.quantity || 0), 0);
  const totalQty = lineItems.reduce((acc, it) => acc + Number(it.quantity || 0), 0);
  const weight = totalWeight > 0 ? totalWeight : MIN_WEIGHT_G * Math.max(1, totalQty);
  return {
    length: maxOrDefault(lengths),
    width: maxOrDefault(widths),
    height: maxOrDefault(heights),
    weight,
  };
};

const buildGhnFeeItems = (lineItems: CheckoutSessionItem[], packageWeightGrams: number): GhnFeeCalculateItem[] => {
  const totalQty = lineItems.reduce((acc, it) => acc + Number(it.quantity || 0), 0) || 1;
  const perUnitFallbackWeight = Math.max(MIN_WEIGHT_G, Math.ceil(packageWeightGrams / totalQty));
  return lineItems.map((it, idx) => {
    const qty = Number(it.quantity || 0);
    const unitWeight = Number(it.weightGram || 0) || perUnitFallbackWeight;
    const dim = (v: number) => {
      const n = Math.round(Number(v) || 0);
      return n > 0 ? n : DEFAULT_PKG_DIM_CM;
    };
    return {
      id: variationIdToNumericId(String(it.variationId || ""), idx),
      name: `${it.productName || ""} ${it.variationName || ""}`.trim() || it.skuCode || "Sản phẩm",
      code: String(it.skuCode || ""),
      quantity: qty,
      weight: Math.max(MIN_WEIGHT_G, Math.round(unitWeight)),
      length: dim(Number(it.lengthCm)),
      width: dim(Number(it.widthCm)),
      height: dim(Number(it.heightCm)),
      convert_weight: 1,
      calculate_weight: 1,
      image_ids: it.image ? [String(it.image)] : [],
    };
  });
};

const pickGhnCalculatedFee = (r: IGhnFeeCalculateResponse | null | undefined): number => {
  if (!r || typeof r !== "object") return 0;
  const n = Number(r.total ?? r.totalFee ?? r.total_fee ?? r.fee ?? r.service_fee ?? r.serviceFee ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const buildGhnFeePayload = (args: {
  warehouse: NearestWarehouseResponse;
  toWardIdV2: number;
  toAddressV2: string;
  service: IOrderShippingServiceItem;
  lineItems: CheckoutSessionItem[];
  isReturn?: boolean;
}): GhnFeeCalculateRequest => {
  const { warehouse, toWardIdV2, toAddressV2, service, lineItems, isReturn } = args;
  const dims = aggregatePackageFromLineItems(lineItems);
  const serviceId = Number(service.serviceId ?? service.service_id ?? 0);
  const serviceTypeId = Number(service.serviceTypeId ?? service.service_type_id ?? 0);

  const warehouseWard = Number(warehouse.wardCode || 0);
  const warehouseAddress = warehouse.addressLine || "";

  const fromWardIdV2 = isReturn ? toWardIdV2 : warehouseWard;
  const fromAddressV2 = isReturn ? toAddressV2 : warehouseAddress;
  const destWardIdV2 = isReturn ? warehouseWard : toWardIdV2;
  const destAddressV2 = isReturn ? warehouseAddress : toAddressV2;

  return {
    shopId: CHECKOUT_SHIPPING_SHOP_ID,
    serviceId,
    serviceTypeId,
    fromWardIdV2,
    fromAddressV2,
    toWardIdV2: destWardIdV2,
    toAddressV2: destAddressV2,
    height: dims.height,
    length: dims.length,
    width: dims.width,
    weight: Math.max(MIN_WEIGHT_G, Math.round(dims.weight)),
    insuranceValue: 0,
    coupon: "",
    items: buildGhnFeeItems(lineItems, dims.weight),
  };
};

export interface CheckoutShippingState {
  warehouse: NearestWarehouseResponse | null;
  service: IOrderShippingServiceItem | null;
  shippingFee: number;
  isLoading: boolean;
  error: string | null;
}

export interface UseCheckoutShippingProps {
  session: CheckoutSession | null | undefined;
  shippingAddress: Partial<ShippingAddress> | null | undefined;
  isReturn?: boolean;
  skipNearestAndCalculate?: boolean;
}

/** Province / ward / street — inputs that affect warehouse & shipping fee APIs. */
export const isShippingQuoteAddressFilled = (address?: Partial<ShippingAddress> | null): boolean => {
  if (!address) return false;
  return Boolean(
    address.provinceCode &&
    Number(address.provinceCode) > 0 &&
    address.wardCode &&
    Number(address.wardCode) > 0 &&
    address.addressLine?.trim(),
  );
};

/** Full checkout address including phone (place order, session sync). */
export const isAddressFilled = (address?: Partial<ShippingAddress> | null): boolean => {
  if (!address) return false;
  return isShippingQuoteAddressFilled(address) && Boolean(address.receiverPhone?.trim());
};

const pickShippingFee = (service: IOrderShippingServiceItem | null | undefined): number => {
  if (!service) return 0;
  return Number(service.totalFee ?? service.fee ?? service.total_fee ?? 0) || 0;
};

const pickServiceId = (service: IOrderShippingServiceItem | null | undefined): number | undefined => {
  if (!service) return undefined;
  const id = service.serviceId ?? service.service_id;
  if (typeof id === "number" && !Number.isNaN(id)) return id;
  if (typeof id === "string" && /^\d+$/.test(id)) return Number(id);
  return undefined;
};

const pickServiceName = (service: IOrderShippingServiceItem | null | undefined): string | undefined => {
  if (!service) return undefined;
  return service.shortName ?? service.serviceName ?? service.short_name ?? service.service_name;
};

/**
 * Tính phí vận chuyển dựa trên địa chỉ giao hàng:
 * 1. Lấy kho gần nhất (warehouses/nearest) khi địa chỉ đầy đủ.
 * 2. Lấy danh sách dịch vụ vận chuyển (services/with-leadtime) dựa trên kho + địa chỉ.
 * 3. Gọi order/orders/fee/calculate với service đầu tiên + kho + địa chỉ.
 * 4. Hiển thị phí từ calculate (fallback phí trong service nếu calculate lỗi).
 */
export const useCheckoutShipping = ({
  session,
  shippingAddress,
  isReturn = false,
  skipNearestAndCalculate = false,
}: UseCheckoutShippingProps) => {
  const [state, setState] = useState<CheckoutShippingState>({
    warehouse: null,
    service: null,
    shippingFee: 0,
    isLoading: false,
    error: null,
  });

  const requestIdRef = useRef(0);

  const items = useMemo(() => flattenCheckoutSessionItems(session?.items ?? []), [session]);

  const totalWeightGrams = useMemo(
    () => items.reduce((acc, item) => acc + Number(item.weightGram || 0) * Number(item.quantity || 0), 0),
    [items],
  );

  const shippingQuoteAddress = useMemo(
    () => ({
      provinceCode: Number(shippingAddress?.provinceCode || 0),
      provinceName: shippingAddress?.provinceName || "",
      wardCode: Number(shippingAddress?.wardCode || 0),
      wardName: shippingAddress?.wardName || "",
      addressLine: (shippingAddress?.addressLine || "").trim(),
    }),
    [
      shippingAddress?.provinceCode,
      shippingAddress?.provinceName,
      shippingAddress?.wardCode,
      shippingAddress?.wardName,
      shippingAddress?.addressLine,
    ],
  );

  const debouncedQuoteAddress = useDebounce({ value: shippingQuoteAddress, delay: 600 });

  const shippingAddressRef = useRef(shippingAddress);
  shippingAddressRef.current = shippingAddress;

  const itemsKey = useMemo(
    () =>
      JSON.stringify(
        items.map((it) => ({
          variationId: it.variationId,
          sku: it.skuCode,
          quantity: it.quantity,
        })),
      ),
    [items],
  );

  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    const currentItems = itemsRef.current;
    if (!isShippingQuoteAddressFilled(debouncedQuoteAddress) || currentItems.length === 0) {
      setState({ warehouse: null, service: null, shippingFee: 0, isLoading: false, error: null });
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    let cancelled = false;
    const abortController = new AbortController();

    const run = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const receiverPhone = (shippingAddressRef.current?.receiverPhone || "").trim();
      const nearestPhone = receiverPhone || undefined;

      try {
        const warehouse = await CheckoutApi.getNearestWarehouse(
          {
            items: currentItems.map((it) => ({
              variationId: String(it.variationId || ""),
              sku: String(it.skuCode || ""),
              quantity: Number(it.quantity || 0),
            })),
            shippingAddress: {
              ...(nearestPhone ? { phone: nearestPhone } : {}),
              wardCode: debouncedQuoteAddress.wardCode,
              wardName: debouncedQuoteAddress.wardName,
              addressLine: debouncedQuoteAddress.addressLine,
              provinceCode: debouncedQuoteAddress.provinceCode,
              provinceName: debouncedQuoteAddress.provinceName,
            },
          },
          { signal: abortController.signal },
        );

        if (cancelled || requestIdRef.current !== requestId) return;

        const warehouseWard = Number(warehouse?.wardCode || 0);
        const warehouseAddress = warehouse?.addressLine || "";

        const fromWardIdV2 = isReturn ? debouncedQuoteAddress.wardCode : warehouseWard;
        const fromAddressV2 = isReturn ? debouncedQuoteAddress.addressLine : warehouseAddress;
        const toWardIdV2 = isReturn ? warehouseWard : debouncedQuoteAddress.wardCode;
        const toAddressV2 = isReturn ? warehouseAddress : debouncedQuoteAddress.addressLine;

        const services = await CheckoutApi.getOrderShippingServicesWithLeadtime(
          {
            shopId: CHECKOUT_SHIPPING_SHOP_ID,
            fromWardIdV2,
            fromAddressV2,
            toWardIdV2,
            toAddressV2,
            totalWeightGrams,
          },
          { signal: abortController.signal },
        );

        if (cancelled || requestIdRef.current !== requestId) return;

        const firstService = Array.isArray(services) && services.length > 0 ? services[0] : null;

        let shippingFee = pickShippingFee(firstService);
        if (firstService && warehouse && !skipNearestAndCalculate) {
          try {
            const feePayload = buildGhnFeePayload({
              warehouse,
              toWardIdV2: debouncedQuoteAddress.wardCode,
              toAddressV2: debouncedQuoteAddress.addressLine,
              service: firstService,
              lineItems: currentItems,
              isReturn,
            });
            const feeResult = await CheckoutApi.calculateOrderShippingFee(feePayload, {
              signal: abortController.signal,
            });
            if (cancelled || requestIdRef.current !== requestId) return;
            shippingFee = pickGhnCalculatedFee(feeResult);
          } catch {
            if (cancelled || requestIdRef.current !== requestId) return;
            shippingFee = pickShippingFee(firstService);
          }
        } else if (skipNearestAndCalculate) {
          // Pre-order: skip calculateFee, fee=0 — giá ship lấy từ pricing response
          // Vẫn cần set service để pricing có carrierServiceId
          setState({
            warehouse: warehouse || null,
            service: firstService,
            shippingFee: 0,
            isLoading: false,
            error: null,
          });
          return;
        }

        if (!firstService || shippingFee <= 0) {
          setState({
            warehouse: warehouse || null,
            service: firstService || null,
            shippingFee: 0,
            isLoading: false,
            error: "Địa chỉ này không hỗ trợ giao hàng",
          });
          return;
        }

        setState({
          warehouse: warehouse || null,
          service: firstService,
          shippingFee,
          isLoading: false,
          error: null,
        });
      } catch (err: unknown) {
        if (cancelled || requestIdRef.current !== requestId) return;
        if (axios.isAxiosError(err) && err.code === "ERR_CANCELED") return;
        const message = getErrorMessage(err) || "Địa chỉ này không hỗ trợ giao hàng";
        setState({
          warehouse: null,
          service: null,
          shippingFee: 0,
          isLoading: false,
          error: message,
        });
      }
    };

    run();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [debouncedQuoteAddress, itemsKey, totalWeightGrams, skipNearestAndCalculate, isReturn]);

  return {
    ...state,
    serviceId: pickServiceId(state.service),
    serviceName: pickServiceName(state.service),
  };
};

export default useCheckoutShipping;
