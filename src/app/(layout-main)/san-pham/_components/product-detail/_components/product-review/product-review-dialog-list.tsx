"use client";

import React, { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import useSWR from "swr";

import { Star01 } from "@untitledui/icons";
import { DialogComponent } from "@/components";
import { MyAccountOrderProductSummary } from "../../../../../tai-khoan/_components/my-account-history-orders/components/my-account-history-orders-list";
import { StackAlignCenter, StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";
import { OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import { getProductReviewOrderByOrderId } from "@/utils/api/product/product.api";
import { ProductReviewStatus } from "@/utils/api/product/product.enum";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

interface ProductReviewDialogListProps {
  open: boolean;
  order: OrderDetailResponse | null;
  onClose: () => void;
}

const REVIEW_STATUS_CONFIG: Record<ProductReviewStatus, { label: string; color: string; backgroundColor: string }> = {
  [ProductReviewStatus.APPROVED]: {
    label: "Đã duyệt",
    color: "#019A01",
    backgroundColor: "#019A011F",
  },
  [ProductReviewStatus.PENDING]: {
    label: "Chờ duyệt",
    color: "#EAB308",
    backgroundColor: "#FEF9C3",
  },
  [ProductReviewStatus.REJECTED]: {
    label: "Từ chối",
    color: "#EF4444",
    backgroundColor: "#FEE4E2",
  },
};

const getReviewStatusConfig = (status: string) =>
  REVIEW_STATUS_CONFIG[status as ProductReviewStatus] ?? {
    label: status,
    color: "#3F3F46",
    backgroundColor: "#F4F4F5",
  };

const ReviewReadonlyField = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;

  return (
    <Stack sx={{ gap: 0 }}>
      <Typography
        sx={{
          ...TYPOGRAPHY_STYLES.base.regular,
          color: "#6B7280",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          ...TYPOGRAPHY_STYLES.base.regular,
          color: "#0A0A0A",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
};

const ProductReviewDialogList: React.FC<ProductReviewDialogListProps> = ({ open, order, onClose }) => {
  const { data, isLoading } = useSWR(open && order?.id ? `product-review-order/${order.id}` : null, () =>
    getProductReviewOrderByOrderId(order!.id),
  );

  const orderItemsByProductId = useMemo(() => {
    const itemMap = new Map<string, OrderDetailResponse["items"][number]>();

    (order?.items ?? []).forEach((item) => {
      if (!itemMap.has(item.productId)) {
        itemMap.set(item.productId, item);
      }
    });

    return itemMap;
  }, [order?.items]);

  const reviews = data?.reviews ?? [];
  const headerStatusConfig = reviews.length === 1 ? getReviewStatusConfig(reviews[0].status) : null;

  return (
    <DialogComponent
      open={open}
      onClose={onClose}
      title="XEM ĐÁNH GIÁ SẢN PHẨM"
      titleAdornment={
        headerStatusConfig ? (
          <Box
            sx={{
              px: "8px",
              py: "4px",
              borderRadius: "2px",
              backgroundColor: headerStatusConfig.backgroundColor,
              color: headerStatusConfig.color,
              ...TYPOGRAPHY_STYLES.base.regular,
              whiteSpace: "nowrap",
            }}
          >
            {headerStatusConfig.label}
          </Box>
        ) : null
      }
      sx={{
        maxWidth: "550px",
        width: "100%",
      }}
      sxTitle={{
        marginBottom: "16px",
        paddingBottom: "16px",
        borderBottom: "1px solid #E5E7EB",
      }}
      sxContent={{
        width: "100%",
        maxHeight: "70vh",
        overflowY: "auto",
        scrollbarWidth: "none",
      }}
    >
      {isLoading ? (
        <Box sx={{ py: 2 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: "#6B7280" }}>Đang tải đánh giá sản phẩm...</Typography>
        </Box>
      ) : reviews.length === 0 ? (
        <Box sx={{ py: 2 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: "#6B7280" }}>Chưa có đánh giá nào cho đơn hàng này.</Typography>
        </Box>
      ) : (
        <StackAlignCenter
          sx={{ width: "100%" }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <Stack sx={{ width: "100%", gap: 2 }}>
            {reviews.map((review, index) => {
              const orderItem = orderItemsByProductId.get(review.productId);
              const statusConfig = getReviewStatusConfig(review.status);
              const shouldShowInlineStatus = reviews.length > 1;

              return (
                <Stack
                  key={review.id}
                  sx={{
                    gap: "16px",
                    paddingBottom: index === reviews.length - 1 ? 0 : "16px",
                    borderBottom: index === reviews.length - 1 ? "none" : "1px solid #F1F5F9",
                  }}
                >
                  <StackRowAlignCenterJustBetween sx={{ alignItems: "flex-start", gap: "16px" }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {orderItem ? (
                        <MyAccountOrderProductSummary item={orderItem} />
                      ) : (
                        <Typography
                          sx={{
                            ...TYPOGRAPHY_STYLES.base.regular,
                            color: "#0A0A0A",
                          }}
                        >
                          Sản phẩm không còn hiển thị trong đơn hàng.
                        </Typography>
                      )}
                    </Box>

                    <StackRowAlignCenter sx={{ gap: "8px", flexShrink: 0 }}>
                      {review.isAnonymous ? (
                        <Typography
                          sx={{
                            ...TYPOGRAPHY_STYLES.base.regular,
                            color: "#6B7280",
                          }}
                        >
                          Ẩn danh
                        </Typography>
                      ) : null}
                      {shouldShowInlineStatus ? (
                        <Box
                          sx={{
                            px: "8px",
                            py: "4px",
                            borderRadius: "2px",
                            backgroundColor: statusConfig.backgroundColor,
                            color: statusConfig.color,
                            ...TYPOGRAPHY_STYLES.base.regular,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {statusConfig.label}
                        </Box>
                      ) : null}
                    </StackRowAlignCenter>
                  </StackRowAlignCenterJustBetween>

                  <StackRowAlignCenter sx={{ gap: "8px", justifyContent: "center", width: "100%" }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = star <= review.rating;

                      return (
                        <Box key={star} sx={{ lineHeight: 0 }}>
                          <Star01
                            size={32}
                            fill={isActive ? "#DDFC46" : "#F3F3F6"}
                            color={isActive ? "#2C3E50" : "#F3F3F6"}
                            strokeWidth={1}
                          />
                        </Box>
                      );
                    })}
                  </StackRowAlignCenter>

                  {review.images.length > 0 ? (
                    <StackRowAlignCenter sx={{ gap: "8px", flexWrap: "wrap" }}>
                      {review.images.map((image, imageIndex) => (
                        <Box
                          key={`${review.id}-${imageIndex}`}
                          component="img"
                          src={image}
                          alt={
                            orderItem?.productName ? `${orderItem.productName} - ảnh ${imageIndex + 1}` : `Ảnh đánh giá ${imageIndex + 1}`
                          }
                          sx={{
                            width: "77px",
                            aspectRatio: "11 / 13",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      ))}
                    </StackRowAlignCenter>
                  ) : null}

                  <Stack sx={{ gap: "16px" }}>
                    <ReviewReadonlyField label="Điểm nổi bật của sản phẩm" value={review.headline} />
                    <ReviewReadonlyField label="Chi tiết đánh giá sản phẩm" value={review.comment} />
                  </Stack>

                  {index !== reviews.length - 1 ? <Box sx={{ borderBottom: "1px solid #E5E7EB", marginTop: "16px" }} /> : null}
                </Stack>
              );
            })}
          </Stack>
        </StackAlignCenter>
      )}
    </DialogComponent>
  );
};

export default ProductReviewDialogList;
