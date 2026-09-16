"use client";
import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import Image from "next/image";
import { toast } from "react-toastify";

import { StackAlignCenter, StackRowAlignCenter } from "@/components/styled";
import { Send01 } from "@untitledui/icons";
import TextFieldPhoneNumberComponent from "@/components/text-field/text-field-phone-number.component";
import { PHONE_REGEX, VALIDATION_MESSAGES } from "@/utils/constants/common.constant";
import { useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { IS_LOYALTY_UI_ENABLED } from "@/utils/constants/commerce-feature.constant";
import { CustomerRequestApi } from "@/utils/api";
import { getErrorMessage } from "@/utils/helpers/axios";

import useStyles from "./status-view.styles";
import { buildGuestOrderAccessHref } from "@/utils/order/guest-order-access.util";
import {
  buildPreOrderGuestAccessHref,
  isPreOrderAccessToken,
  PRE_ORDER_DETAIL_ROUTE,
  preparePreOrderMemberDetailNavigation,
} from "@/utils/api/pre-order/pre-order-detail.util";
import { buildOrderDetailNavigation } from "@/utils/order/order-detail-context.util";

interface SuccessStatusProps {
  orderCode?: string;
  orderPhone?: string;
  guestOrderAccessToken?: string;
  guestOrderAccessExpiresAt?: string;
  /** Pre-order confirmation copy (AC1). Same logic as normal success. */
  isPreOrder?: boolean;
}

const SuccessStatus = ({ orderCode, orderPhone, guestOrderAccessToken, isPreOrder = false }: SuccessStatusProps) => {
  const { classes, cx } = useStyles();
  const isLogin = useAppSelector(selectIsLogin);

  const [phoneNumber, setPhoneNumber] = useState(orderPhone || "");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneNumberChange = (val: string) => {
    setPhoneNumber(val);
    if (phoneNumberError) setPhoneNumberError("");
  };

  const handlePhoneNumberBlur = () => {
    if (phoneNumber && !PHONE_REGEX.test(phoneNumber)) {
      setPhoneNumberError(VALIDATION_MESSAGES.phone);
    }
  };

  const handleSupportRequest = async () => {
    if (isLoading) return;
    if (phoneNumber && !PHONE_REGEX.test(phoneNumber)) {
      setPhoneNumberError(VALIDATION_MESSAGES.phone);
      return;
    }
    setIsLoading(true);
    try {
      await CustomerRequestApi.postOrderSupportRequest({
        phone: phoneNumber,
        orderCode: orderCode ?? "",
      });
      toast.success("Yêu cầu hỗ trợ đã được gửi. Chúng tôi sẽ sớm liên hệ với bạn.");
      setPhoneNumber("");
    } catch (error) {
      toast.error(getErrorMessage(error) || "Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = () => {
    if (isLogin && orderCode) {
      if (isPreOrder) {
        preparePreOrderMemberDetailNavigation(orderCode);
        window.location.href = PRE_ORDER_DETAIL_ROUTE;
        return;
      }
      window.location.href = buildOrderDetailNavigation({ orderCode });
      return;
    }
    if (guestOrderAccessToken) {
      window.location.href =
        isPreOrder || isPreOrderAccessToken(guestOrderAccessToken)
          ? buildPreOrderGuestAccessHref(guestOrderAccessToken)
          : buildGuestOrderAccessHref(guestOrderAccessToken);
    }
  };

  const canViewOrderDetail = isLogin || Boolean(guestOrderAccessToken);

  const title = isPreOrder ? "ĐẶT TRƯỚC THÀNH CÔNG" : "ĐẶT HÀNG THÀNH CÔNG";
  const orderIdLabel = isPreOrder ? "Mã đơn đặt trước:" : "Mã đơn hàng:";
  const supportLabel = "BẠN CẦN HỖ TRỢ VỀ ĐƠN HÀNG NÀY?";
  const phoneLabel = isPreOrder ? "Nhập số điện thoại để được hỗ trợ" : "Nhập số điện thoại";

  return (
    <StackAlignCenter className={cx(classes.card, classes.successCard)}>
      <StackAlignCenter className={classes.successContent}>
        <StackAlignCenter className={classes.successHeader}>
          <Box className={classes.successIllustration}>
            <Image src="/image/checkout/payment-success.svg" alt="Success" width={300} height={169} priority />
          </Box>

          <Typography className={classes.title}>{title}</Typography>
        </StackAlignCenter>

        <StackAlignCenter sx={{ gap: 1.5, width: "100%" }}>
          <StackRowAlignCenter className={classes.orderIdLabelWrapper}>
            <Typography className={classes.orderIdLabel}>{orderIdLabel}&nbsp;</Typography>
            <Typography className={classes.orderIdValue}>#{orderCode}</Typography>
          </StackRowAlignCenter>

          {isPreOrder ? (
            <Typography className={classes.messageContent}>
              Đơn đặt trước của bạn đã được hệ thống ghi nhận. Khi sản phẩm sẵn sàng, bộ phận CSKH sẽ gửi thông báo hoặc liên hệ để hỗ trợ
              bạn hoàn tất thanh toán đơn hàng. Bạn vui lòng chú ý điện thoại để không bỏ lỡ thông báo nhé!
            </Typography>
          ) : IS_LOYALTY_UI_ENABLED ? null : (
            <Typography className={classes.messageContent}>Vui lòng kiểm tra ZNS xác nhận để theo dõi trạng thái đơn hàng.</Typography>
          )}
        </StackAlignCenter>
      </StackAlignCenter>

      <StackAlignCenter className={classes.successActions}>
        {canViewOrderDetail ? (
          <Button variant="outlined" className={classes.buttonSecondary} onClick={handleViewOrder}>
            Xem Chi Tiết Đơn Hàng
          </Button>
        ) : null}

        <StackAlignCenter className={classes.successContactInfoWrapper}>
          <Typography className={classes.supportLabel}>{supportLabel}</Typography>
          <StackRowAlignCenter className={classes.contactInfo}>
            <Box className={classes.textFieldPhoneNumber}>
              <TextFieldPhoneNumberComponent
                label={phoneLabel}
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                onBlur={handlePhoneNumberBlur}
                error={phoneNumberError}
              />
            </Box>
            <StackAlignCenter className={classes.sendIcon} onClick={handleSupportRequest}>
              <Send01 size={24} />
            </StackAlignCenter>
          </StackRowAlignCenter>
        </StackAlignCenter>
      </StackAlignCenter>
    </StackAlignCenter>
  );
};

export default SuccessStatus;
