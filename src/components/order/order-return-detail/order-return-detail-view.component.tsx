"use client";

import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { StackAlignCenter, StackRow } from "@/components/styled";
import OrderTimelineSection from "../order-timeline/order-timeline.component";
import OrderProductListSection from "../order-product-list/order-product-list.component";
import OrderReturnDetailHeader from "./order-return-detail-header.component";
import OrderReturnDetailInfoSection, { type OrderReturnInfoRow } from "./order-return-detail-info-section.component";
import OrderReturnDetailReasonSection from "./order-return-detail-reason-section.component";
import useStyles from "./order-return-detail-view.styles";
import {
  mapReturnProductsToOrderListItems,
  type OrderReturnDetailViewModel,
} from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-detail.mapper";
import OrderExchangeSummary from "@/app/(layout-main)/don-hang/chi-tiet/_components/order-exchange/order-exchange-confirmation/order-exchange-summary/order-exchange-summary.component";
import OrderRefundSummary from "@/app/(layout-main)/don-hang/chi-tiet/_components/order-exchange/order-exchange-confirmation/order-refund-summary/order-refund-summary.component";

export interface OrderReturnDetailViewProps {
  viewModel: OrderReturnDetailViewModel;
  withdrawing?: boolean;
  onWithdraw?: () => void;
}

const OrderReturnDetailView = ({ viewModel, withdrawing, onWithdraw }: OrderReturnDetailViewProps) => {
  const { classes } = useStyles();
  const isExchange = viewModel.exchangeProducts.length > 0;

  const returnListProducts = useMemo(
    () => mapReturnProductsToOrderListItems(viewModel.returnProducts, viewModel.returnQuantities),
    [viewModel.returnProducts, viewModel.returnQuantities],
  );
  const exchangeListProducts = useMemo(
    () => mapReturnProductsToOrderListItems(viewModel.exchangeProducts, viewModel.replacementQuantities),
    [viewModel.exchangeProducts, viewModel.replacementQuantities],
  );

  const infoRows: OrderReturnInfoRow[] = [
    { label: "Ngày gửi yêu cầu", value: viewModel.createdAtLabel || "—" },
    { label: "Tên người liên hệ", value: viewModel.pickupFullName || "—" },
    { label: "Số điện thoại", value: viewModel.pickupPhone || "—" },
    { label: "Địa chỉ thu hồi", value: viewModel.withdrawalAddressLine || "—" },
  ];

  const bankRows: OrderReturnInfoRow[] = [
    { label: "Tên chủ tài khoản", value: viewModel.refundBankAccountHolder || "—" },
    { label: "Số tài khoản ngân hàng", value: viewModel.refundBankAccountNumber || "—" },
    { label: "Tên ngân hàng", value: viewModel.refundBankName || "—" },
    { label: "Chi nhánh ngân hàng", value: viewModel.refundBankBranch || "—" },
  ];
  const hasRefundBank = Boolean(
    viewModel.refundBankAccountHolder || viewModel.refundBankAccountNumber || viewModel.refundBankName || viewModel.refundBankBranch,
  );

  return (
    <StackRow className={classes.root}>
      <StackAlignCenter className={classes.content}>
        <Box className={classes.sectionWrapper}>
          <OrderReturnDetailHeader
            returnCode={viewModel.returnCode}
            orderCode={viewModel.orderCode}
            statusInfo={viewModel.statusInfo}
            canWithdraw={viewModel.canWithdraw}
            withdrawing={withdrawing}
            onWithdraw={onWithdraw}
          />
          <OrderReturnDetailInfoSection rows={infoRows} />
        </Box>

        {hasRefundBank ? (
          <Box className={classes.sectionWrapper}>
            <Box sx={{ px: 2, pt: 2, pb: 0, color: "#6B7280", fontSize: 14 }}>Thông tin tài khoản ngân hàng</Box>
            <OrderReturnDetailInfoSection rows={bankRows} />
          </Box>
        ) : null}

        <Box className={classes.sectionWrapper}>
          <OrderReturnDetailReasonSection
            reasonLabel={viewModel.reasonLabel}
            note={viewModel.note}
            evidenceImageUrls={viewModel.evidenceImageUrls}
            type={viewModel.type}
          />
        </Box>

        <Box className={classes.sectionWrapper}>
          <OrderTimelineSection items={viewModel.timelineItems} title="Tình trạng yêu cầu đổi trả/hoàn tiền" />
        </Box>

        {returnListProducts.length > 0 && (
          <Box className={classes.sectionWrapper}>
            <OrderProductListSection title="Sản phẩm bạn muốn trả" products={returnListProducts} />
          </Box>
        )}

        {isExchange && exchangeListProducts.length > 0 && (
          <Box className={classes.sectionWrapper}>
            <OrderProductListSection title="Sản phẩm bạn muốn đổi sang" products={exchangeListProducts} />
          </Box>
        )}

        <Box className={classes.sectionWrapper}>
          {isExchange ? (
            <OrderExchangeSummary
              totalPriceToReturn={viewModel.totalReturnValue}
              priceDifference={viewModel.priceDifference}
              refundedLoyaltyPoints={viewModel.refundedLoyaltyPoints}
              quotedReturnShippingFee={viewModel.returnShippingFee}
              quotedExchangeShippingFee={viewModel.exchangeShippingFee}
            />
          ) : (
            <OrderRefundSummary
              totalPriceToReturn={viewModel.totalReturnValue}
              refundedLoyaltyPoints={viewModel.refundedLoyaltyPoints}
              quotedReturnShippingFee={viewModel.returnShippingFee}
              paymentMethod={viewModel.paymentMethod}
            />
          )}
        </Box>
      </StackAlignCenter>
    </StackRow>
  );
};

export default OrderReturnDetailView;
