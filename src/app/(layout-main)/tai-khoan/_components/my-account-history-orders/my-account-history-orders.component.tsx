"use client";

import React, { useEffect, useState } from "react";
import { Typography, useTheme, useMediaQuery, Stack, Box, Tabs, Tab } from "@mui/material";
import useStyles from "./my-account-history-orders.styles";
import TextFieldSearch from "@/components/text-field/text-field-search";
import { StackRowAlignCenter } from "@/components/styled/stack.style";
import { useDraggableScroll } from "@/hooks";
import MyAccountHistoryOrdersList from "./components/my-account-history-orders-list";
import { getOrderStatusInfo } from "@/utils/api/order";
import { getPreOrderDetailLookupCode, getPreOrderStatusInfo, isPreOrderOrder } from "@/utils/api/pre-order/pre-order-order.util";
import { PRE_ORDER_DETAIL_ROUTE, preparePreOrderMemberDetailNavigation } from "@/utils/api/pre-order/pre-order-detail.util";
import type { OrderListItem, OrderListSummary } from "@/utils/api/checkout/checkout.interface";
import {
  DEFAULT_ORDER_HISTORY_TAB_ID,
  getOrderHistoryTabConfig,
  ORDER_HISTORY_TABS,
  type OrderHistoryTabId,
} from "./_constants/order-history-tabs.constant";
import { useMyAccountHistoryOrdersInfinite } from "./hooks/use-my-account-history-orders-infinite.hook";
import { useStableOrderSummary } from "./hooks/use-stable-order-summary.hook";

function getHistoryOrderStatusInfo(order: OrderListItem) {
  if (isPreOrderOrder(order)) return getPreOrderStatusInfo(order.preOrderStatus);
  return getOrderStatusInfo(order);
}

function getHistoryOrderHref(order: OrderListItem) {
  return isPreOrderOrder(order) ? PRE_ORDER_DETAIL_ROUTE : `/don-hang/${order.orderCode}`;
}

function handleSelectHistoryOrder(order: OrderListItem) {
  if (!isPreOrderOrder(order)) return;
  const lookupCode = getPreOrderDetailLookupCode(order);
  if (lookupCode) preparePreOrderMemberDetailNavigation(lookupCode);
}

/** `key={tabId}` ở parent — remount để size infinite luôn = 1 khi đổi tab. */
function HistoryOrdersPanel({
  tabId,
  search,
  classes,
  onSummaryChange,
}: {
  tabId: OrderHistoryTabId;
  search: string;
  classes: ReturnType<typeof useStyles>["classes"];
  onSummaryChange: (summary: OrderListSummary | undefined) => void;
}) {
  const { orders, summary, hasMore, isInitialLoading, isLoadingMore, loadMore } = useMyAccountHistoryOrdersInfinite({
    search,
    tab: getOrderHistoryTabConfig(tabId),
  });

  useEffect(() => {
    onSummaryChange(summary);
  }, [summary, onSummaryChange]);

  return (
    <MyAccountHistoryOrdersList
      data={orders}
      isLoading={isInitialLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={loadMore}
      classes={classes}
      getStatusInfo={getHistoryOrderStatusInfo}
      getOrderHref={getHistoryOrderHref}
      onSelectOrder={handleSelectHistoryOrder}
    />
  );
}

const MyAccountHistoryOrders = () => {
  const { classes, cx } = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(810));
  const [activeTabId, setActiveTabId] = useState<OrderHistoryTabId>(DEFAULT_ORDER_HISTORY_TAB_ID);
  const [search, setSearch] = useState("");
  const [liveSummary, setLiveSummary] = useState<OrderListSummary | undefined>();
  const { ref: tabsRef, isDragging, handlers: scrollHandlers } = useDraggableScroll();
  const displaySummary = useStableOrderSummary(liveSummary, search);

  return (
    <Stack sx={{ gap: "24px", minWidth: 0 }}>
      {!isMobile && <Typography className={classes.sectionTitle}>Lịch sử đơn hàng</Typography>}

      <Tabs
        ref={tabsRef}
        value={activeTabId}
        onChange={(_, newValue) => setActiveTabId(newValue)}
        variant="scrollable"
        scrollButtons={false}
        {...scrollHandlers}
        allowScrollButtonsMobile
        sx={{
          width: "100%",
          "& .MuiTabs-indicator": {
            backgroundColor: "#000",
            height: "2px",
            bottom: "2px",
          },
          "& .MuiTabs-scroller": {
            overflowX: "auto !important",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: isDragging ? "none" : "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          },
          "& .MuiTabs-flexContainer": {
            width: "fit-content",
            minWidth: "100%",
            pointerEvents: isDragging ? "none" : "auto",
          },
        }}
      >
        {ORDER_HISTORY_TABS.map((tab) => {
          const count = tab.getCount(displaySummary);
          return (
            <Tab
              key={tab.id}
              value={tab.id}
              className={cx(classes.tabItem, activeTabId === tab.id && "active")}
              label={
                <StackRowAlignCenter gap="8px">
                  <Box component="span">{tab.label}</Box>
                  {count > 0 ? <Box className={classes.tabBadge}>{count}</Box> : null}
                </StackRowAlignCenter>
              }
              disableRipple
            />
          );
        })}
      </Tabs>

      <Box className={classes.searchFieldWrap}>
        <TextFieldSearch placeholder="Tìm kiếm" onChange={(e) => setSearch(e.target.value)} sx={{ maxWidth: "100%", width: "100%" }} />
      </Box>

      <HistoryOrdersPanel key={activeTabId} tabId={activeTabId} search={search} classes={classes} onSummaryChange={setLiveSummary} />
    </Stack>
  );
};

export default MyAccountHistoryOrders;
