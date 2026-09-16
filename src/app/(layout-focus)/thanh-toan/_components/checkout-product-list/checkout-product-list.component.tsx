import React, { useEffect, useRef, useState } from "react";
import { Box, Stack, Theme, Typography, useMediaQuery } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { CheckoutFulfillmentSummary, CheckoutSessionItem, CheckoutSessionLine } from "@/utils/api/checkout/checkout.interface";
import { isCheckoutSessionSetItem } from "@/utils/api/checkout/checkout.util";
import CheckoutProductItem from "./components/checkout-product-item.component";
import CheckoutSetItem from "./components/checkout-set-item.component";
import useStyles from "./checkout-product-list.styles";
import { StackAlignCenter, StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";
import { formatPrice } from "@/utils/constants/common.constant";
import { PRE_ORDER_EXPECTED_STOCK_LABEL } from "@/utils/constants/pre-order-badge.constant";
import { useProductDefaultImage } from "@/components/providers.component";
import { resolveCheckoutItemVariantLines } from "../checkout.helpers";

interface CheckoutProductListSectionProps {
  items: CheckoutSessionLine[];
  looseItems?: CheckoutSessionItem[];
  totalQuantity?: number;
  totalPrice?: number;
  totalSavings?: number;
  fulfillmentSummary?: CheckoutFulfillmentSummary | null;
}

interface FlattenedCheckoutItem {
  id: string;
  entityId?: string;
  variationId: string;
  parentCheckoutItemId?: string | null;
  sourceVariationId?: string | null;
  image: string;
  name: string;
  variantLines: string[];
  quantity: number;
  price: string;
  originalPrice?: string;
  isGift: boolean;
}

interface CheckoutItemGroup {
  id: string;
  parent: FlattenedCheckoutItem;
  attached: FlattenedCheckoutItem[];
}

const CheckoutProductListSection = ({
  items = [],
  looseItems,
  totalQuantity = 0,
  totalPrice = 0,
  totalSavings = 0,
  fulfillmentSummary,
}: CheckoutProductListSectionProps) => {
  const { classes, cx } = useStyles();
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up(1199));
  const productDefaultImage = useProductDefaultImage();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      setShowSeeMore(scrollHeight > clientHeight);
    }
  }, [items]);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const reachedBottom = scrollTop + clientHeight >= scrollHeight - 10;

    setIsAtBottom(reachedBottom);
    setShowSeeMore(!(scrollTop > 20 && !reachedBottom));
  };

  const handleSeeMoreClick = () => {
    if (!scrollRef.current) return;

    if (isAtBottom) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  if (!items.length) return null;

  const setItems = items.filter(isCheckoutSessionSetItem);
  const displayLooseItems = looseItems ?? items.filter((item): item is CheckoutSessionItem => !isCheckoutSessionSetItem(item));

  const groupedItems: CheckoutItemGroup[] = displayLooseItems.reduce<CheckoutItemGroup[]>((groups, item, index) => {
    const quantity = Math.max(0, Math.round(Number(item.quantity) || 0));
    const customerDisplayPrice = item.customerDisplayPrice;
    const currentUnitPriceMinor = Math.max(
      0,
      Math.round(Number(customerDisplayPrice?.sellingPriceAfterTaxMinor ?? item.salePrice ?? item.unitPrice ?? 0) || 0),
    );
    const compareAtUnitPriceMinorRaw =
      customerDisplayPrice?.compareAtPriceAfterTaxMinor ??
      (customerDisplayPrice ? null : Math.max(0, Math.round(Number(item.unitPrice ?? item.salePrice ?? 0) || 0)));
    const compareAtUnitPriceMinor =
      compareAtUnitPriceMinorRaw != null ? Math.max(0, Math.round(Number(compareAtUnitPriceMinorRaw) || 0)) : null;
    const showCompareAtPrice = compareAtUnitPriceMinor != null && compareAtUnitPriceMinor > currentUnitPriceMinor;
    const normalizedItem: FlattenedCheckoutItem = {
      id: item.packagingRelationId || `${item.variationId}-${index}`,
      entityId: item.id,
      variationId: item.variationId,
      parentCheckoutItemId: item.parentCheckoutItemId,
      sourceVariationId: item.sourceVariationId,
      image: item.image || productDefaultImage || "",
      name: item.productName?.trim() || item.variationName?.trim() || item.skuCode || "Sản phẩm",
      variantLines: resolveCheckoutItemVariantLines(item),
      quantity,
      // Rule checkout: mỗi dòng SKU hiển thị giá / 1 đơn vị, không nhân quantity
      price: formatPrice(currentUnitPriceMinor),
      originalPrice: showCompareAtPrice ? formatPrice(compareAtUnitPriceMinor) : undefined,
      isGift: item.lineType === "PACKAGING_INCLUDED" || item.lineType === "PACKAGING_OPTIONAL",
    };

    if (!normalizedItem.isGift) {
      groups.push({
        id: normalizedItem.entityId || normalizedItem.id,
        parent: normalizedItem,
        attached: [],
      });
      return groups;
    }

    const parentGroup =
      groups.find((group) => group.parent.entityId && group.parent.entityId === normalizedItem.parentCheckoutItemId) ||
      groups.find((group) => group.parent.variationId === normalizedItem.sourceVariationId);

    if (parentGroup) {
      parentGroup.attached.push(normalizedItem);
      return groups;
    }

    groups.push({
      id: `${normalizedItem.id}-orphan`,
      parent: normalizedItem,
      attached: [],
    });
    return groups;
  }, []);

  const totalVisibleItems = setItems.length + groupedItems.reduce((count, group) => count + 1 + group.attached.length, 0);

  const fulfillmentBanner =
    fulfillmentSummary?.label && fulfillmentSummary?.value ? (
      <Box className={classes.fulfillmentSummary}>
        <Typography className={classes.fulfillmentSummaryLabel}>{PRE_ORDER_EXPECTED_STOCK_LABEL}</Typography>
        <Typography className={classes.fulfillmentSummaryValue}>{fulfillmentSummary.value}</Typography>
      </Box>
    ) : null;

  const renderProductItems = () => (
    <React.Fragment>
      {setItems.map((item) => (
        <CheckoutSetItem key={item.lineId} item={item} />
      ))}
      {groupedItems.map((group, index) => (
        <Stack key={`${group.id}-${index}`} className={classes.group}>
          <CheckoutProductItem
            image={group.parent.image}
            name={group.parent.name}
            variantLines={group.parent.variantLines}
            quantity={group.parent.quantity}
            price={group.parent.price}
            originalPrice={group.parent.originalPrice}
            isGift={group.parent.isGift}
            badgeLabel={group.parent.isGift ? "Kèm theo" : undefined}
          />

          {group.attached.length > 0 && (
            <Stack className={classes.attachedGroup}>
              {group.attached.map((attached, attachedIndex) => (
                <CheckoutProductItem
                  key={`${attached.id}-${attachedIndex}`}
                  image={attached.image}
                  name={attached.name}
                  variantLines={attached.variantLines}
                  quantity={attached.quantity}
                  price={attached.price}
                  originalPrice={attached.originalPrice}
                  isGift
                  compact
                  badgeLabel="Kèm theo"
                />
              ))}
            </Stack>
          )}
        </Stack>
      ))}
    </React.Fragment>
  );

  if (isDesktop) {
    return (
      <Stack className={classes.root}>
        <Stack className={classes.desktopList}>
          <Stack className={classes.scrollContainer} ref={scrollRef} onScroll={handleScroll}>
            {renderProductItems()}
          </Stack>

          {totalVisibleItems > 3 && (
            <StackAlignCenter>
              <StackRowAlignCenter className={cx(classes.seeMoreChip, !showSeeMore && "hidden")} onClick={handleSeeMoreClick}>
                <Typography className={classes.seeMoreText}>{isAtBottom ? "Thu gọn" : "Xem thêm"}</Typography>
                <KeyboardArrowDownIcon
                  className={classes.seeMoreIcon}
                  sx={{
                    transform: isAtBottom ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </StackRowAlignCenter>
            </StackAlignCenter>
          )}
        </Stack>
        {fulfillmentBanner}
      </Stack>
    );
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.tabletSummaryContainer}>
        <StackRowAlignCenterJustBetween className={classes.tabletSummary} onClick={() => setIsExpanded(!isExpanded)}>
          <Box className={classes.summaryHeaderInfo}>
            <Typography className={classes.summaryTitle}>TỔNG SẢN PHẨM</Typography>
            <Typography className={classes.summaryQty}>{totalQuantity} sản phẩm</Typography>
          </Box>

          <Box className={classes.summaryPriceWrapper}>
            <Typography className={classes.summaryTotalPrice}>{formatPrice(totalPrice)}</Typography>
            <Typography className={classes.summarySavings}>Tiết kiệm {formatPrice(totalSavings)}</Typography>
          </Box>

          <ExpandMoreIcon
            className={classes.arrowIcon}
            sx={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "0.3s",
            }}
          />
        </StackRowAlignCenterJustBetween>

        <Stack className={cx(classes.collapsibleContent, isExpanded && "expanded")}>{renderProductItems()}</Stack>
      </Box>
      {fulfillmentBanner}
    </Box>
  );
};

export default CheckoutProductListSection;
