"use client";

import React, { useEffect, useState } from "react";
import { Box, Stack, Switch, Typography } from "@mui/material";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useSWRConfig } from "swr";
import { toast } from "react-toastify";
import { DialogComponent, TextFieldComponent, TextFieldUploadImagesComponent } from "@/components";
import { Star01 } from "@untitledui/icons";
import { StackAlignCenter, StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";
import { MyAccountOrderProductSummary } from "../../../../../tai-khoan/_components/my-account-history-orders/components/my-account-history-orders-list";
import { OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import { createManyFiles } from "@/utils/api/file/file.api";
import { FileType } from "@/utils/api/file/file.enum";
import { postProductReviewBatch } from "@/utils/api/product/product.api";
import { TextFieldUploadImagesValue } from "@/components/text-field/text-field-upload-images.component";
import { ButtonComponent } from "@/components/button/button.component";
import { getErrorMessage } from "@/utils/helpers/axios";
import { PRODUCT_REVIEW_MY_ORDERS_SWR_KEY } from "@/hooks/use-reviewed-orders.hook";

interface ProductReviewDialogCreateProps {
  open: boolean;
  order: OrderDetailResponse | null;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

interface ProductReviewDraftItem {
  orderItemId: string;
  productId: string;
  rating: number;
  headline: string;
  comment: string;
  isAnonymous: boolean;
  images: TextFieldUploadImagesValue[];
}

interface ProductReviewFormValues {
  items: ProductReviewDraftItem[];
}

const buildInitialDrafts = (order: OrderDetailResponse | null): ProductReviewDraftItem[] => {
  if (!order) return [];

  return order.items.map((item) => ({
    orderItemId: item.id,
    productId: item.productId,
    rating: 5,
    headline: "",
    comment: "",
    isAnonymous: false,
    images: [],
  }));
};

const ProductReviewDialogCreate: React.FC<ProductReviewDialogCreateProps> = ({ open, order, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useSWRConfig();
  const { control, handleSubmit, reset, watch } = useForm<ProductReviewFormValues>({
    defaultValues: { items: [] },
  });
  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      reset({ items: [] });
      return;
    }

    reset({ items: buildInitialDrafts(order) });
  }, [open, order, reset]);

  const orderItems = order?.items ?? [];
  const drafts = watch("items");
  const isValid = drafts.length > 0 && drafts.every((draft) => draft.rating >= 1);

  const onSubmit = async (values: ProductReviewFormValues) => {
    if (!order) return;

    if (!isValid) {
      toast.error("Vui lòng chọn số sao cho tất cả sản phẩm.");
      return;
    }

    setIsSubmitting(true);

    try {
      const items = await Promise.all(
        orderItems.map(async (item) => {
          const draft = values.items.find((entry) => entry.orderItemId === item.id);
          if (!draft) {
            throw new Error("Không tìm thấy dữ liệu đánh giá sản phẩm.");
          }

          const uploadPayload = draft.images
            .filter((image) => image.file)
            .map((image) => ({
              file: image.file as File,
              isOverwrite: true,
              type: FileType.IMAGE,
            }));

          const uploadedImages = uploadPayload.length > 0 ? await createManyFiles(uploadPayload) : null;

          return {
            productId: draft.productId,
            rating: draft.rating,
            comment: draft.comment.trim() || undefined,
            headline: draft.headline.trim() || undefined,
            images: uploadedImages?.items?.map((uploadedItem) => uploadedItem.url) || [],
            isAnonymous: draft.isAnonymous,
          };
        }),
      );

      await postProductReviewBatch({
        orderId: order.id,
        items,
      });

      await mutate(PRODUCT_REVIEW_MY_ORDERS_SWR_KEY);
      toast.success("Gửi đánh giá sản phẩm thành công.");
      onClose();
      await onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogComponent
      open={open}
      onClose={onClose}
      title="YÊU CẦU ĐÁNH GIÁ SẢN PHẨM"
      sx={{ maxWidth: "550px", width: "100%" }}
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
      buttonCenter={
        <ButtonComponent
          content="Gửi đánh giá"
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
          disabled={!order || !isValid || isSubmitting}
          sx={{
            width: "100%",
            borderRadius: 0,
            backgroundColor: "#171717",
            color: "#FFFFFF",
            textTransform: "none",
            padding: "12px 16px",
            "&.Mui-disabled": {
              opacity: 0.4,
              backgroundColor: "#A1A1AA",
              color: "#FFFFFF",
            },
          }}
        />
      }
    >
      <StackAlignCenter
        sx={{ width: "100%" }}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Stack sx={{ width: "100%", gap: 2 }}>
          {fields.map((field, index) => {
            const item = orderItems[index];
            const draft = drafts[index];
            if (!item || !draft) return null;

            return (
              <Stack
                key={field.id}
                sx={{
                  gap: "16px",
                  paddingBottom: index === orderItems.length - 1 ? 0 : "16px",
                  borderBottom: index === orderItems.length - 1 ? "none" : "1px solid #F1F5F9",
                }}
              >
                <MyAccountOrderProductSummary item={item} />

                <Controller
                  name={`items.${index}.rating`}
                  control={control}
                  render={({ field: ratingField }) => (
                    <StackRowAlignCenter sx={{ gap: "8px", justifyContent: "center", width: "100%" }}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isActive = star <= (ratingField.value || 0);
                        return (
                          <Box key={star} onClick={() => ratingField.onChange(star)} sx={{ cursor: "pointer", lineHeight: 0 }}>
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
                  )}
                />

                <Controller
                  name={`items.${index}.images`}
                  control={control}
                  render={({ field: imageField }) => (
                    <TextFieldUploadImagesComponent values={imageField.value || []} onChange={imageField.onChange} maxImages={3} />
                  )}
                />

                <Controller
                  name={`items.${index}.headline`}
                  control={control}
                  render={({ field: headlineField }) => (
                    <TextFieldComponent
                      label="Điểm nổi bật của sản phẩm"
                      value={headlineField.value}
                      onValueChange={headlineField.onChange}
                    />
                  )}
                />

                <Controller
                  name={`items.${index}.comment`}
                  control={control}
                  render={({ field: commentField }) => (
                    <TextFieldComponent
                      label="Viết chi tiết đánh giá sản phẩm"
                      value={commentField.value}
                      onValueChange={commentField.onChange}
                      multiline
                      rows={4}
                    />
                  )}
                />

                <Controller
                  name={`items.${index}.isAnonymous`}
                  control={control}
                  render={({ field: anonymousField }) => (
                    <StackRowAlignCenterJustBetween sx={{ gap: "16px" }}>
                      <Typography sx={{ fontSize: "14px", lineHeight: 1.5, color: "#27251F" }}>Đánh giá ẩn danh</Typography>
                      <Switch checked={Boolean(anonymousField.value)} onChange={(_, checked) => anonymousField.onChange(checked)} />
                    </StackRowAlignCenterJustBetween>
                  )}
                />
              </Stack>
            );
          })}
        </Stack>
      </StackAlignCenter>
    </DialogComponent>
  );
};

export default ProductReviewDialogCreate;
