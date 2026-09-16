"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { useOrderDetailRoute } from "@/hooks/order/use-order-detail-route.hook";
import useSWR from "swr";
import { toast } from "react-toastify";

import { BreadcrumbComponent } from "@/components";
import { getOrderMeByOrderCode, postOrderLookupByOrderCode } from "@/utils/api/checkout/checkout.api";
import { ProductApi } from "@/utils/api";
import type { OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import {
  computeExchangePriceDifferenceSigned,
  computeTotalReturnSaleValue,
} from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-pricing.util";
import { isOrderReturnReason, ORDER_EXCHANGE_REASON_OPTIONS, type OrderReturnReason } from "@/utils/api/order/order.enum";
import { createClientOrderReturn } from "@/utils/api/order/order.api";
import { getErrorMessage } from "@/utils/helpers/axios";

import type { OrderProductItemData } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-product-item.interface";
import type { PickupAddressValues } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-return-pickup.interface";
import {
  buildClientOrderExchangePayload,
  buildClientOrderReturnFormData,
} from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-payload.util";
import { buildOrderDetailHref } from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-routes.util";
import { gotoBack } from "@/utils/helpers/common/navigation";
import { useOrderReturnEvidence } from "@/app/(layout-main)/don-hang/chi-tiet/_hooks/use-order-return-evidence.hook";
import { useOrderReturnBreadcrumb } from "@/app/(layout-main)/don-hang/chi-tiet/_hooks/use-order-return-breadcrumb.hook";
import { useOrderReturnFlowDraft } from "@/app/(layout-main)/don-hang/chi-tiet/_hooks/use-order-return-flow-draft.hook";
import { evidenceFilesFromValues } from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-evidence.util";
import type { OrderReturnDraftHydration } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-return-draft.interface";

import useStyles from "./yeu-cau-doi-hang.styles";
import {
  OrderReturnFlowSkeleton,
  OrderReturnStepper as OrderExchangeStepper,
  OrderReturnReturnSelection as ExchangeReturnSelection,
  OrderReturnReplacementSelection as ExchangeReplacementSelection,
  OrderReturnConfirmation as ExchangeConfirmation,
} from "../_components";

const STEPS = ["Chọn sản phẩm trả", "Chọn sản phẩm đổi", "Xác nhận thông tin"];
const MAX_STEP = STEPS.length - 1;

function OrderExchangePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { classes } = useStyles();
  const { orderCode, source, trackingPhone, isHydrated } = useOrderDetailRoute();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [exchangeQuantities, setExchangeQuantities] = useState<Record<string, number>>({});
  const [replacementProducts, setReplacementProducts] = useState<OrderProductItemData[]>([]);
  const [replacementQuantities, setReplacementQuantities] = useState<Record<string, number>>({});
  const [selectedReason, setSelectedReason] = useState<OrderReturnReason | "">("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialPickupAddress, setInitialPickupAddress] = useState<PickupAddressValues | undefined>();
  const [pickupAddressDraft, setPickupAddressDraft] = useState<PickupAddressValues | undefined>();

  const { evidenceImages, handleEvidenceImagesChange, isEvidenceUploading } = useOrderReturnEvidence();

  const breadcrumbItems = useOrderReturnBreadcrumb({
    orderCode: orderCode ?? "",
    source,
    trackingPhone,
    lastLabel: "Yêu cầu đổi hàng",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const {
    data: order,
    isLoading,
    error,
  } = useSWR<OrderDetailResponse | null>(
    orderCode && isHydrated ? `order/${orderCode}/exchange?source=${source ?? ""}` : null,
    async () => {
      if (source === "tracking") return await postOrderLookupByOrderCode(orderCode!, trackingPhone || "");
      return await getOrderMeByOrderCode(orderCode!);
    },
  );

  const { data: productsData, isLoading: isProductsLoading } = useSWR("catalog/products/sku-card-v2", () =>
    ProductApi.getProductsSkuCardV2({}),
  );

  const availableProducts = useMemo<OrderProductItemData[]>(
    () =>
      (productsData?.list ?? []).map((product) => {
        const { selectedSku } = product;
        const { customerDisplayPrice } = selectedSku;
        return {
          productId: product.productId,
          variationId: selectedSku.id,
          productName: product.name,
          slug: product.slug,
          image: selectedSku.image ?? "",
          customerDisplayPrice,
          compareAtPriceAfterTaxMinor: customerDisplayPrice.compareAtPriceAfterTaxMinor ?? 0,
          sellingPriceAfterTaxMinor: customerDisplayPrice.sellingPriceAfterTaxMinor ?? 0,
          stockStatus: selectedSku.stockStatus,
        };
      }),
    [productsData],
  );

  const handleDraftRestore = useCallback((hydration: OrderReturnDraftHydration) => {
    setCurrentStep(hydration.currentStep);
    setSelectedItems(hydration.selectedItemIds);
    setExchangeQuantities(hydration.returnQuantities);
    setReplacementProducts(hydration.replacementProducts);
    setReplacementQuantities(hydration.replacementQuantities);
    setSelectedReason(hydration.selectedReason);
    setNote(hydration.note);
    if (hydration.pickupAddress) {
      setInitialPickupAddress(hydration.pickupAddress);
      setPickupAddressDraft(hydration.pickupAddress);
    }
  }, []);

  const getDraftSlice = useCallback(
    () => ({
      currentStep,
      selectedItems,
      returnQuantities: exchangeQuantities,
      replacementProducts,
      replacementQuantities,
      selectedReason,
      note,
      evidenceUrls: [] as string[],
      pickupAddress: pickupAddressDraft,
    }),
    [currentStep, selectedItems, exchangeQuantities, replacementProducts, replacementQuantities, selectedReason, note, pickupAddressDraft],
  );

  const { clearDraft, persistNow } = useOrderReturnFlowDraft({
    flow: "exchange",
    orderCode: orderCode ?? "",
    source,
    trackingPhone,
    maxStep: MAX_STEP,
    order,
    catalogProducts: availableProducts,
    getDraftSlice,
    onRestore: handleDraftRestore,
    isCatalogReady: !isProductsLoading,
  });

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
      queueMicrotask(persistNow);
    },
    [persistNow],
  );

  const handleToggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const isSelecting = !prev.includes(itemId);
      if (isSelecting && exchangeQuantities[itemId] == null) {
        const orderItem = order?.items.find((i) => i.id === itemId);
        const defaultQty = orderItem?.quantity && orderItem.quantity > 0 ? orderItem.quantity : 1;
        setExchangeQuantities((prevQty) => ({ ...prevQty, [itemId]: defaultQty }));
      }
      return isSelecting ? [...prev, itemId] : prev.filter((id) => id !== itemId);
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setExchangeQuantities((prev) => ({ ...prev, [itemId]: quantity }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = order?.items.map((item) => item.id) ?? [];
      setSelectedItems(allIds);
      const initialQty: Record<string, number> = {};
      order?.items.forEach((item) => {
        initialQty[item.id] = exchangeQuantities[item.id] ?? (item.quantity > 0 ? item.quantity : 1);
      });
      setExchangeQuantities(initialQty);
    } else {
      setSelectedItems([]);
    }
  };

  const handleAddReplacement = useCallback((product: OrderProductItemData) => {
    setReplacementProducts((prev) => {
      if (prev.find((p) => p.productId === product.productId)) return prev;
      return [...prev, product];
    });
    setReplacementQuantities((prev) => ({ ...prev, [product.productId]: 1 }));
  }, []);

  const handleRemoveReplacement = useCallback((productId: string) => {
    setReplacementProducts((prev) => prev.filter((p) => p.productId !== productId));
    setReplacementQuantities((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }, []);

  const handleReplacementQuantityChange = useCallback((productId: string, quantity: number | null) => {
    if (quantity === null) return;
    setReplacementQuantities((prev) => ({ ...prev, [productId]: quantity }));
  }, []);

  const totalPriceToReturn = useMemo(() => {
    if (!order) return 0;
    return computeTotalReturnSaleValue(order, selectedItems, exchangeQuantities);
  }, [order, selectedItems, exchangeQuantities]);

  const priceDifference = useMemo(() => {
    if (!order) return 0;
    return computeExchangePriceDifferenceSigned(order, selectedItems, exchangeQuantities, replacementProducts, replacementQuantities);
  }, [order, selectedItems, exchangeQuantities, replacementProducts, replacementQuantities]);

  const handleSubmit = async (pickupAddress: PickupAddressValues) => {
    if (!order || !orderCode) return;

    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để đổi.");
      return;
    }
    if (replacementProducts.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm muốn đổi sang.");
      return;
    }
    if (!selectedReason || !isOrderReturnReason(selectedReason)) {
      toast.warning("Vui lòng chọn lý do đổi hàng.");
      return;
    }
    if (evidenceImages.length === 0) {
      toast.warning("Vui lòng tải lên ảnh/video bằng chứng.");
      return;
    }

    const evidenceFiles = evidenceFilesFromValues(evidenceImages);
    if (evidenceFiles.length === 0) {
      toast.warning("Vui lòng chọn lại ảnh/video bằng chứng.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildClientOrderExchangePayload({
        order,
        selectedItemIds: selectedItems,
        exchangeQuantities,
        replacementProducts,
        replacementQuantities,
        reason: selectedReason,
        note,
        pickupAddress,
      });

      await createClientOrderReturn(buildClientOrderReturnFormData(payload, evidenceFiles));
      clearDraft();
      toast.success("Yêu cầu đổi hàng của bạn đã được gửi thành công!");
      router.push(
        buildOrderDetailHref(orderCode, {
          source,
          trackingPhone,
          searchQuery: source === "tracking" ? undefined : searchParams.toString(),
        }),
      );
    } catch (err) {
      toast.error(getErrorMessage(err) || "Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated || isLoading) {
    return (
      <>
        <BreadcrumbComponent items={breadcrumbItems} />
        <OrderReturnFlowSkeleton stepCount={3} />
      </>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography variant="h5">Không tìm thấy đơn hàng</Typography>
      </Box>
    );
  }

  return (
    <>
      <BreadcrumbComponent items={breadcrumbItems} />
      <Box className={classes.root}>
        <Box className={classes.container}>
          <Box className={classes.header}>
            <Typography className={classes.title}>Yêu cầu đổi hàng</Typography>
            <OrderExchangeStepper currentStep={currentStep} steps={STEPS} />
          </Box>

          {currentStep === 0 && (
            <ExchangeReturnSelection
              order={order}
              selectedItems={selectedItems}
              exchangeQuantities={exchangeQuantities}
              onToggleItem={handleToggleItem}
              onQuantityChange={handleQuantityChange}
              onSelectAll={handleSelectAll}
              onBack={() =>
                gotoBack(
                  router,
                  buildOrderDetailHref(orderCode!, {
                    source,
                    trackingPhone,
                    searchQuery: source === "tracking" ? undefined : searchParams.toString(),
                  }),
                )
              }
              onNext={() => goToStep(1)}
            />
          )}

          {currentStep === 1 && (
            <ExchangeReplacementSelection
              order={order}
              selectedItems={selectedItems}
              exchangeQuantities={exchangeQuantities}
              replacementProducts={replacementProducts}
              replacementQuantities={replacementQuantities}
              availableProducts={availableProducts}
              isProductsLoading={isProductsLoading}
              onAddReplacement={handleAddReplacement}
              onRemoveReplacement={handleRemoveReplacement}
              onReplacementQuantityChange={handleReplacementQuantityChange}
              priceDifference={priceDifference}
              onBack={() => goToStep(0)}
              onNext={() => goToStep(2)}
            />
          )}

          {currentStep === 2 && (
            <ExchangeConfirmation
              order={order}
              selectedItems={selectedItems}
              exchangeQuantities={exchangeQuantities}
              replacementProducts={replacementProducts}
              replacementQuantities={replacementQuantities}
              exchangeReasonOptions={ORDER_EXCHANGE_REASON_OPTIONS}
              selectedReason={selectedReason}
              onReasonChange={(v: string) => setSelectedReason(isOrderReturnReason(v) ? v : "")}
              note={note}
              onNoteChange={setNote}
              evidenceImages={evidenceImages}
              onEvidenceImagesChange={handleEvidenceImagesChange}
              isEvidenceUploading={isEvidenceUploading}
              initialPickupAddress={initialPickupAddress}
              onPickupAddressChange={setPickupAddressDraft}
              totalPriceToReturn={totalPriceToReturn}
              priceDifference={priceDifference}
              isSubmitting={isSubmitting}
              onBack={() => goToStep(1)}
              onSubmit={handleSubmit}
            />
          )}
        </Box>
      </Box>
    </>
  );
}

export default OrderExchangePage;
