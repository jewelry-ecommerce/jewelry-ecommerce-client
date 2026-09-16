"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { useOrderDetailRoute } from "@/hooks/order/use-order-detail-route.hook";
import useSWR from "swr";
import { toast } from "react-toastify";

import { BreadcrumbComponent } from "@/components";
import { getOrderMeByOrderCode, postOrderLookupByOrderCode } from "@/utils/api/checkout/checkout.api";
import type { OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import { computeTotalReturnSaleValue } from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-pricing.util";
import { isOrderReturnReason, ORDER_EXCHANGE_REASON_OPTIONS, type OrderReturnReason } from "@/utils/api/order/order.enum";
import { createClientOrderReturn } from "@/utils/api/order/order.api";
import { getErrorMessage } from "@/utils/helpers/axios";

import type { PickupAddressValues } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-return-pickup.interface";
import type { OrderProductItemData } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-product-item.interface";
import {
  buildClientOrderRefundPayload,
  buildClientOrderReturnFormData,
} from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-payload.util";
import { buildOrderDetailHref } from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-routes.util";
import { gotoBack } from "@/utils/helpers/common/navigation";
import { useOrderReturnEvidence } from "@/app/(layout-main)/don-hang/chi-tiet/_hooks/use-order-return-evidence.hook";
import { useOrderReturnBreadcrumb } from "@/app/(layout-main)/don-hang/chi-tiet/_hooks/use-order-return-breadcrumb.hook";
import { useOrderReturnFlowDraft } from "@/app/(layout-main)/don-hang/chi-tiet/_hooks/use-order-return-flow-draft.hook";
import { evidenceFilesFromValues } from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-evidence.util";
import type { OrderReturnDraftHydration } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-return-draft.interface";
import {
  isRefundBankFormValid,
  isRefundBankRequired,
  normalizeRefundBankAccountHolder,
  type OrderReturnRefundBankValues,
} from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-refund-bank.util";

import useStyles from "./yeu-cau-hoan-tien.styles";
import {
  OrderReturnFlowSkeleton,
  OrderReturnStepper as OrderExchangeStepper,
  OrderReturnReturnSelection as ExchangeReturnSelection,
  OrderReturnConfirmation as ExchangeConfirmation,
} from "../_components";

const STEPS = ["Chọn sản phẩm trả", "Xác nhận thông tin"];
const MAX_STEP = STEPS.length - 1;

function OrderRefundPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { classes } = useStyles();
  const { orderCode, source, trackingPhone, isHydrated } = useOrderDetailRoute();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [selectedReason, setSelectedReason] = useState<OrderReturnReason | "">("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialPickupAddress, setInitialPickupAddress] = useState<PickupAddressValues | undefined>();
  const [pickupAddressDraft, setPickupAddressDraft] = useState<PickupAddressValues | undefined>();

  const { evidenceImages, handleEvidenceImagesChange, isEvidenceUploading } = useOrderReturnEvidence();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const breadcrumbItems = useOrderReturnBreadcrumb({
    orderCode: orderCode ?? "",
    source,
    trackingPhone,
    lastLabel: "Yêu cầu hoàn tiền",
  });

  const {
    data: order,
    isLoading,
    error,
  } = useSWR<OrderDetailResponse | null>(orderCode && isHydrated ? `order/${orderCode}/refund?source=${source ?? ""}` : null, async () => {
    if (source === "tracking") return await postOrderLookupByOrderCode(orderCode!, trackingPhone || "");
    return await getOrderMeByOrderCode(orderCode!);
  });

  const handleDraftRestore = useCallback((hydration: OrderReturnDraftHydration) => {
    setCurrentStep(hydration.currentStep);
    setSelectedItems(hydration.selectedItemIds);
    setReturnQuantities(hydration.returnQuantities);
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
      returnQuantities,
      replacementProducts: [] as OrderProductItemData[],
      replacementQuantities: {} as Record<string, number>,
      selectedReason,
      note,
      evidenceUrls: [] as string[],
      pickupAddress: pickupAddressDraft,
    }),
    [currentStep, selectedItems, returnQuantities, selectedReason, note, pickupAddressDraft],
  );

  const { clearDraft, persistNow } = useOrderReturnFlowDraft({
    flow: "refund",
    orderCode: orderCode ?? "",
    source,
    trackingPhone,
    maxStep: MAX_STEP,
    order,
    catalogProducts: [],
    getDraftSlice,
    onRestore: handleDraftRestore,
    isCatalogReady: true,
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
      if (isSelecting && returnQuantities[itemId] == null) {
        const orderItem = order?.items.find((i) => i.id === itemId);
        const defaultQty = orderItem?.quantity && orderItem.quantity > 0 ? orderItem.quantity : 1;
        setReturnQuantities((prevQty) => ({ ...prevQty, [itemId]: defaultQty }));
      }
      return isSelecting ? [...prev, itemId] : prev.filter((id) => id !== itemId);
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setReturnQuantities((prev) => ({ ...prev, [itemId]: quantity }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = order?.items.map((item) => item.id) ?? [];
      setSelectedItems(allIds);
      const initialQty: Record<string, number> = {};
      order?.items.forEach((item) => {
        initialQty[item.id] = returnQuantities[item.id] ?? (item.quantity > 0 ? item.quantity : 1);
      });
      setReturnQuantities(initialQty);
    } else {
      setSelectedItems([]);
    }
  };

  const totalPriceToReturn = useMemo(() => {
    if (!order) return 0;
    return computeTotalReturnSaleValue(order, selectedItems, returnQuantities);
  }, [order, selectedItems, returnQuantities]);

  const handleSubmit = async (pickupAddress: PickupAddressValues, refundBank?: OrderReturnRefundBankValues) => {
    if (!order || !orderCode) return;

    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để hoàn tiền.");
      return;
    }
    if (!selectedReason || !isOrderReturnReason(selectedReason)) {
      toast.warning("Vui lòng chọn lý do hoàn tiền.");
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

    const requiresBank = isRefundBankRequired(order.paymentMethod);
    if (requiresBank && (!refundBank || !isRefundBankFormValid(refundBank))) {
      toast.warning("Vui lòng nhập đầy đủ thông tin tài khoản nhận hoàn tiền.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildClientOrderRefundPayload({
        order,
        selectedItemIds: selectedItems,
        exchangeQuantities: returnQuantities,
        reason: selectedReason,
        note,
        pickupAddress,
        refundBankAccountHolder: refundBank ? normalizeRefundBankAccountHolder(refundBank.refundBankAccountHolder) : undefined,
        refundBankAccountNumber: refundBank?.refundBankAccountNumber.trim(),
        refundBankName: refundBank?.refundBankName.trim(),
        refundBankBranch: refundBank?.refundBankBranch.trim() || undefined,
      });

      await createClientOrderReturn(buildClientOrderReturnFormData(payload, evidenceFiles));
      clearDraft();
      toast.success("Yêu cầu hoàn tiền của bạn đã được gửi thành công!");
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
        <OrderReturnFlowSkeleton stepCount={2} />
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
            <Typography className={classes.title}>Yêu cầu hoàn tiền</Typography>
            <OrderExchangeStepper currentStep={currentStep} steps={STEPS} />
          </Box>

          {currentStep === 0 && (
            <ExchangeReturnSelection
              order={order}
              selectedItems={selectedItems}
              exchangeQuantities={returnQuantities}
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
              sectionTitle="Chọn sản phẩm trong đơn hàng của bạn"
            />
          )}

          {currentStep === 1 && (
            <ExchangeConfirmation
              variant="refund"
              order={order}
              selectedItems={selectedItems}
              exchangeQuantities={returnQuantities}
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
              priceDifference={0}
              isSubmitting={isSubmitting}
              onBack={() => goToStep(0)}
              onSubmit={handleSubmit}
            />
          )}
        </Box>
      </Box>
    </>
  );
}

export default OrderRefundPage;
