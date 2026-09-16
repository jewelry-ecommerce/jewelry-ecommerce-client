"use client";

import React from "react";
import { OrderReturnCancelConfirmModal, OrderReturnOptionModal } from "@/app/(layout-main)/don-hang/chi-tiet/_components";
import type { OrderReturnExchangeOptionType } from "@/app/(layout-main)/don-hang/chi-tiet/_components/order-return-option-modal/order-return-exchange-option-modal.component";
import OrderCancelConfirmModal from "@/components/order/order-cancel-confirm-modal/order-cancel-confirm-modal.component";
import CheckoutStatusModal from "@/app/(layout-focus)/thanh-toan/_components/checkout-status-modal/checkout-status-modal.component";
import ProductReviewDialogCreate from "@/app/(layout-main)/san-pham/_components/product-detail/_components/product-review/product-review-dialog-create";
import ProductReviewDialogList from "@/app/(layout-main)/san-pham/_components/product-detail/_components/product-review/product-review-dialog-list";
import type { OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import type { OrderCancellationReason } from "@/utils/api/order/order.enum";

export interface OrderActionDialogsProps {
  reviewOrder: OrderDetailResponse | null;
  isCreateReviewDialogOpen: boolean;
  isViewReviewDialogOpen: boolean;
  onCloseReviewDialog: () => void;
  returnExchangeModalOpen: boolean;
  onCloseReturnExchangeModal: () => void;
  onSelectReturnOption: (option: OrderReturnExchangeOptionType) => void;
  cancelReturnConfirmOpen: boolean;
  onCloseCancelReturnConfirm: () => void;
  onConfirmCancelReturn: () => void;
  isCancellingReturn: boolean;
  cancelOrderConfirmOpen: boolean;
  onCloseCancelOrderConfirm: () => void;
  onConfirmCancelOrder: (cancellationReason: OrderCancellationReason) => void;
  isCancellingOrder: boolean;
  cancelOrderVariant?: "default" | "pre-order";
  payooLoadingOpen: boolean;
  onClosePayooLoading: () => void;
}

const OrderActionDialogs = ({
  reviewOrder,
  isCreateReviewDialogOpen,
  isViewReviewDialogOpen,
  onCloseReviewDialog,
  returnExchangeModalOpen,
  onCloseReturnExchangeModal,
  onSelectReturnOption,
  cancelReturnConfirmOpen,
  onCloseCancelReturnConfirm,
  onConfirmCancelReturn,
  isCancellingReturn,
  cancelOrderConfirmOpen,
  onCloseCancelOrderConfirm,
  onConfirmCancelOrder,
  isCancellingOrder,
  cancelOrderVariant = "default",
  payooLoadingOpen,
  onClosePayooLoading,
}: OrderActionDialogsProps) => (
  <>
    <ProductReviewDialogCreate open={isCreateReviewDialogOpen} order={reviewOrder} onClose={onCloseReviewDialog} />
    <ProductReviewDialogList open={isViewReviewDialogOpen} order={reviewOrder} onClose={onCloseReviewDialog} />
    <OrderReturnOptionModal open={returnExchangeModalOpen} onClose={onCloseReturnExchangeModal} onSelectOption={onSelectReturnOption} />
    <OrderReturnCancelConfirmModal
      open={cancelReturnConfirmOpen}
      onClose={onCloseCancelReturnConfirm}
      onConfirm={onConfirmCancelReturn}
      loading={isCancellingReturn}
    />
    <OrderCancelConfirmModal
      open={cancelOrderConfirmOpen}
      onClose={onCloseCancelOrderConfirm}
      onConfirm={onConfirmCancelOrder}
      loading={isCancellingOrder}
      variant={cancelOrderVariant}
    />
    <CheckoutStatusModal open={payooLoadingOpen} type="payoo_loading" onClose={onClosePayooLoading} />
  </>
);

export default OrderActionDialogs;
