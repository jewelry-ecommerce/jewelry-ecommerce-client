"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { Box, Stack, Typography } from "@mui/material";
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween, StackRowAlignJustCenter } from "@/components/styled";
import useStyles from "../../product-detail.styles";
import { Star01 } from "@untitledui/icons";
import { ProductFilterControls, PaginationComponent } from "@/components";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { getProductReviewStats, getProductReviews } from "@/utils/api/product/product.api";
import type { IProductReviewListItem } from "@/utils/api/product/product.interface";
import { formatDate } from "@/utils/format";

interface Reply {
  author: string;
  time: string;
  text: string;
}

interface Review {
  id: string;
  author: string;
  time: string;
  rating: number;
  text: string;
  subText: string;
  images?: string[];
  reply?: Reply;
}

interface ProductReviewProps {
  productId: string;
  productName?: string;
}

const REVIEW_TAKE = 5;

const SORT_MAPPER: Record<string, { orderBy: string; orderType: "ASC" | "DESC" }> = {
  newest: { orderBy: "updatedAt", orderType: "DESC" },
  oldest: { orderBy: "updatedAt", orderType: "ASC" },
  highest_rating: { orderBy: "rating", orderType: "DESC" },
  lowest_rating: { orderBy: "rating", orderType: "ASC" },
};

const mapReviewItem = (review: IProductReviewListItem): Review => {
  const primaryReply = review.replies?.[0];

  return {
    id: review.id,
    author: review.isAnonymous
      ? "Khách hàng ẩn danh"
      : `${review.createdByUser?.lastName?.trim() || ""} ${review.createdByUser?.firstName?.trim() || ""}`.trim() || "Khách hàng",
    time: formatDate(review.createdAt),
    rating: review.rating,
    text: review.headline?.trim() || "Đánh giá sản phẩm",
    subText: review.comment?.trim() || "",
    images: review.images || [],
    reply: primaryReply
      ? {
          author:
            `${primaryReply.createdByUser?.lastName?.trim() || ""} ${primaryReply.createdByUser?.firstName?.trim() || ""}`.trim() ||
            "Admin",
          time: formatDate(primaryReply.createdAt),
          text: primaryReply.message,
        }
      : undefined,
  };
};

const ReviewItemComponent = ({ review, productName }: { review: Review; productName?: string }) => {
  const { classes } = useStyles();

  return (
    <Box className={classes.reviewItem}>
      {/* Column 1: Author Info */}
      <Stack className={classes.reviewAuthorCol}>
        <Typography className={classes.reviewAuthorName}>{review.author}</Typography>
        <Typography className={classes.reviewTime}>{review.time}</Typography>
      </Stack>

      {/* Column 2: Review Content */}
      <Stack className={classes.reviewContentColContainer}>
        <Stack className={classes.reviewContentCol}>
          <Box className={classes.reviewStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star01 key={star} size={16} fill={star <= review.rating ? "#DDFC46" : "#E0E0E0"} color="#2C3E50" />
            ))}
          </Box>
          <Typography className={classes.reviewText}>{review.text}</Typography>
          <Typography className={classes.reviewSubText}>{review.subText}</Typography>
        </Stack>

        {review.images && review.images.length > 0 && (
          <StackRow className={classes.reviewImages}>
            {review.images.slice(0, 3).map((img, idx) => (
              <Box
                key={idx}
                component="img"
                src={img}
                alt={productName ? `${productName} - ảnh ${idx + 1}` : `Ảnh đánh giá ${idx + 1}`}
                className={classes.reviewImage}
              />
            ))}
          </StackRow>
        )}

        {review.reply && (
          <Stack gap={1}>
            {/* <StackRowAlignCenter 
              onClick={() => setIsReplyOpen(!isReplyOpen)} 
              sx={{ cursor: 'pointer', width: 'fit-content' }}
              gap={1}
            >
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#000' }}>
                Phản hồi (1)
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                transition: 'transform 0.2s',
                transform: isReplyOpen ? 'none' : 'rotate(180deg)'
              }}>
                <Image src="/image/icons/icon-arrow-up.svg" alt="arrow" width={20} height={20} />
              </Box>
            </StackRowAlignCenter> */}

            <Stack sx={{ gap: 1, borderLeft: "1px solid #737373", paddingLeft: 3 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.md.bold, color: "#171717" }}>{review.reply.author}</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: "#737373" }}>{review.reply.time}</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: "#171717" }}>{review.reply.text}</Typography>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

const ProductReview = ({ productId, productName }: ProductReviewProps) => {
  const { classes, cx } = useStyles();
  const [activeStarFilter, setActiveStarFilter] = useState<number | null>(5);
  const [sortValue, setSortValue] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const starFilters = ["all", 5, 4, 3, 2, 1];

  const sortOptions = [
    { label: "Gần nhất", value: "newest" },
    { label: "Cũ nhất", value: "oldest" },
    { label: "Đánh giá cao nhất", value: "highest_rating" },
    { label: "Đánh giá thấp nhất", value: "lowest_rating" },
  ];

  const sortConfig = SORT_MAPPER[sortValue] || SORT_MAPPER.newest;

  const {
    data: reviewsResponse,
    isLoading,
    isValidating,
  } = useSWR(
    productId
      ? ["product-reviews", productId, sortConfig.orderBy, sortConfig.orderType, currentPage, REVIEW_TAKE, activeStarFilter ?? "ALL"]
      : null,
    ([, productIdValue, orderBy, orderType, page, , rating]) =>
      getProductReviews({
        productId: productIdValue,
        orderBy,
        orderType,
        page,
        take: REVIEW_TAKE,
        isPagination: true,
        rating: rating === "ALL" ? undefined : Number(rating),
      }),
    {
      keepPreviousData: true,
    },
  );

  const { data: reviewStatsResponse } = useSWR(productId ? ["product-review-stats", productId] : null, ([, productIdValue]) =>
    getProductReviewStats(productIdValue),
  );

  const reviews = useMemo(() => (reviewsResponse?.list || []).map(mapReviewItem), [reviewsResponse?.list]);

  const averageRating =
    reviewStatsResponse?.averageRating ??
    (reviewsResponse?.list?.length
      ? reviewsResponse.list.reduce((total, item) => total + item.rating, 0) / reviewsResponse.list.length
      : 0);

  const roundedAverageRating = Math.round(averageRating);
  const totalReviews =
    activeStarFilter === null
      ? (reviewStatsResponse?.totalReviews ?? reviewsResponse?.pagination?.total ?? reviewsResponse?.total ?? 0)
      : (reviewsResponse?.pagination?.total ?? reviewsResponse?.total ?? 0);

  return (
    <Box>
      {/* Review Header */}
      <StackRowAlignCenter className={classes.reviewHeader}>
        <Typography className={classes.reviewTitle}>Đánh giá sản phẩm</Typography>

        <StackRowAlignCenter className={classes.ratingSummary}>
          <Typography className={classes.ratingNumber}>{averageRating.toFixed(1)}</Typography>
          <StackRowAlignCenter gap="2px">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star01 key={star} size={20} fill={star <= roundedAverageRating ? "#DDFC46" : "#E0E0E0"} color="#2C3E50" />
            ))}
          </StackRowAlignCenter>
        </StackRowAlignCenter>
      </StackRowAlignCenter>

      {/* Filter Container */}
      <StackRowAlignCenterJustBetween className={classes.reviewFilter}>
        <Typography className={classes.reviewCount}>{totalReviews} đánh giá</Typography>
        <Box className={classes.reviewSortMobile}>
          <ProductFilterControls
            sections={[]}
            onSectionsChange={() => {}}
            sortOptions={sortOptions}
            sortValue={sortValue}
            onSortChange={(value) => {
              setSortValue(value);
              setCurrentPage(1);
            }}
            filterLabel=""
            variant="simple"
            sxRoot={{ borderTop: "none", borderBottom: "none" }}
          />
        </Box>
      </StackRowAlignCenterJustBetween>
      <Box className={classes.filterContainer}>
        <Box className={classes.filterList}>
          <Typography className={classes.filterLabel}>Đánh giá:</Typography>
          <StackRow sx={{ flexWrap: "wrap", gap: 2 }}>
            {starFilters.map((star) => (
              <Box
                key={star}
                className={cx(classes.filterItem, {
                  [classes.filterItemActive]: activeStarFilter === star,
                  [classes.filterItemInactive]: activeStarFilter !== star,
                })}
                onClick={() => {
                  setActiveStarFilter(star === "all" ? null : Number(star));
                  setCurrentPage(1);
                }}
              >
                {star === "all" ? "Tất Cả" : `${star} sao`}
              </Box>
            ))}
          </StackRow>
        </Box>

        <Box className={classes.reviewSortDesktop}>
          <ProductFilterControls
            sections={[]}
            onSectionsChange={() => {}}
            sortOptions={sortOptions}
            sortValue={sortValue}
            onSortChange={(value) => {
              setSortValue(value);
              setCurrentPage(1);
            }}
            filterLabel=""
            variant="simple"
            sxRoot={{ borderTop: "none", borderBottom: "none" }}
          />
        </Box>
      </Box>

      <Box sx={{ minHeight: reviews.length > 0 ? undefined : { xs: 260, md: 320 } }}>
        {reviews.length > 0 ? (
          <React.Fragment>
            {isValidating && !isLoading ? (
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: "#737373", marginBottom: "16px" }}>
                Đang cập nhật đánh giá...
              </Typography>
            ) : null}
            {reviews.map((review) => (
              <ReviewItemComponent key={review.id} review={review} productName={productName} />
            ))}
          </React.Fragment>
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{ py: { xs: 8, md: 12 }, px: 3 }} spacing={2}>
            <StackRowAlignCenter gap="4px" sx={{ opacity: 0.4, mb: 1 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star01 key={star} size={36} fill="none" color="#737373" />
              ))}
            </StackRowAlignCenter>

            <Typography
              sx={{
                ...TYPOGRAPHY_STYLES.md?.bold,
                color: "#171717",
                textAlign: "center",
              }}
            >
              Chưa có đánh giá nào
            </Typography>

            <Typography
              sx={{
                ...TYPOGRAPHY_STYLES.base?.regular,
                color: "#737373",
                textAlign: "center",
                maxWidth: 400,
              }}
            >
              Sản phẩm này hiện chưa có đánh giá. Cùng trải nghiệm và trở thành người đầu tiên chia sẻ cảm nhận của bạn nhé!
            </Typography>
          </Stack>
        )}
      </Box>

      <StackRowAlignJustCenter>
        <PaginationComponent
          scrollToTop={false}
          total={reviewsResponse?.pagination?.total}
          take={REVIEW_TAKE}
          page={currentPage}
          onChange={({ page }) => setCurrentPage(page)}
        />
      </StackRowAlignJustCenter>
    </Box>
  );
};

export default ProductReview;
