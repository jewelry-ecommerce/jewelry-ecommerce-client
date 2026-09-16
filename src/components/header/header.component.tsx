"use client";

import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled/stack.style";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectCurrentUser, selectIsLogin } from "@/redux/slices/auth.slice";
import { closeCartDrawer, openCartDrawer, selectCartTotalQuantity } from "@/redux/slices/cart.slice";
import useCartCheckout from "@/hooks/cart/use-cart-checkout.hook";
import type { CartFulfillmentGroup } from "@/utils/api/cart/cart-availability.util";
import { CmsApi } from "@/utils/api";
import { buildNavigationHref, isExternalNavigationHref, isNavigationItemActive, isNavigationItemPathPrefixActive } from "@/utils/api/cms";
import type { StorefrontNavigationItem, TopBannerResponse } from "@/utils/api/cms/cms.interface";
import { buildAuthUrl } from "@/utils/helpers/common/navigation";
import { Badge, Box, Typography, useMediaQuery } from "@mui/material";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import useSWR from "swr";
import { Heart, Menu01, SearchMd, ShoppingBag02, User01, XClose } from "@untitledui/icons";
import { AppLink } from "..";
import CartDrawerComponent from "@/app/(layout-main)/gio-hang/_components/cart-drawer.component";
import HeaderMegaMenu, { NavigationBadge } from "./header-mega-menu/header-mega-menu.component";
import HeaderMegaSearch, { HeaderMegaSearchTrigger, type HeaderMegaSearchRef } from "./header-mega-search/header-mega-search.component";
import HeaderUserAccount from "./header-user-account/header-user-account.component";
import { useLogoSrc } from "@/components/providers.component";
import HeaderTopBannerSkeleton from "./header-top-banner-skeleton.component";
import useStyles from "./header.styles";
import { useSyncSiteHeaderHeight } from "@/hooks/use-sync-site-header-height.hook";

const getTopBannerText = (banner: TopBannerResponse) => banner.bannerContent?.trim() || banner.bannerName?.trim() || "";

const Header = () => {
  const logoSrc = useLogoSrc();
  const router = useRouter();
  const pathname = usePathname();

  const { data: globalConfig, isLoading: isGlobalConfigLoading } = useSWR(
    "cms/storefront/global-config",
    () => CmsApi.getStorefrontGlobalConfig(),
    {
      shouldRetryOnError: false,
    },
  );
  const { data: navigationData } = useSWR("cms/storefront/navigation", () => CmsApi.getStorefrontNavigation(), {
    shouldRetryOnError: false,
  });

  const topBanner = globalConfig?.header ?? null;
  const isTopBannerLoading = isGlobalConfigLoading;
  const resolvedBanner = topBanner ?? null;
  const navigationItems = useMemo(() => navigationData?.items ?? [], [navigationData?.items]);
  const bannerAnimationStyle = resolvedBanner?.bannerAnimationStyle;
  const bannerSpeed = resolvedBanner?.bannerLoopIntervalSec || 10;
  const bannerText = resolvedBanner ? getTopBannerText(resolvedBanner) : "";
  const activeNavigationRootId = useMemo(
    () =>
      navigationItems.find(
        (item) => isNavigationItemActive(item, { pathname, checkChildren: true }) || isNavigationItemPathPrefixActive(item, pathname),
      )?.id ?? null,
    [navigationItems, pathname],
  );

  const isLogin = useAppSelector(selectIsLogin);
  const isPC = useMediaQuery("(min-width:1200px)");
  const dispatch = useAppDispatch();
  const cartTotalQuantity = useAppSelector(selectCartTotalQuantity);
  const { initiateCheckoutFromCart, isInitiatingCheckout } = useCartCheckout();
  const isCartDrawerOpen = useAppSelector((state) => state.cart.isDrawerOpen);
  const user = useAppSelector(selectCurrentUser);
  const isMobileHeader = useMediaQuery("(max-width:810px)");
  const { classes, cx } = useStyles({
    props: {
      bg: resolvedBanner?.bannerBgColor,
      color: resolvedBanner?.bannerTextColor,
      speed: bannerSpeed,
    },
  });
  const topBannerItemClass =
    bannerAnimationStyle === "SLIDE" || bannerAnimationStyle === "MARQUEE"
      ? classes.bannerItemMarquee
      : bannerAnimationStyle === "FADE"
        ? classes.bannerItemFade
        : classes.bannerItemStatic;

  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HeaderMegaSearchRef>(null);
  const headerRef = useRef<HTMLElement>(null);
  const headerHeight = useSyncSiteHeaderHeight(headerRef);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [anchorElUser, setAnchorElUser] = useState<HTMLDivElement | null>(null);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const showTopBanner = Boolean(bannerText && visible);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleDrawerCheckout = useCallback(
    async (options?: { fulfillmentGroup?: CartFulfillmentGroup }) => {
      await initiateCheckoutFromCart({
        mode: "all-eligible",
        fulfillmentGroup: options?.fulfillmentGroup,
        onBeforeNavigate: () => {
          dispatch(closeCartDrawer());
        },
      });
    },
    [dispatch, initiateCheckoutFromCart],
  );

  const navigateToNavigationItem = (item: StorefrontNavigationItem) => {
    const href = buildNavigationHref(item);
    if (!href) return;

    if (item.openInNewTab && typeof window !== "undefined") {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }

    if (isExternalNavigationHref(href) && typeof window !== "undefined") {
      window.location.href = href;
      return;
    }

    router.push(href);
  };

  const handleOpenMenu = (item?: StorefrontNavigationItem) => {
    if (item && !item.children?.length) {
      navigateToNavigationItem(item);
      return;
    }

    setSelectedRootId(item?.id ?? navigationItems[0]?.id ?? null);
    setMenuOpen(true);
  };

  const handleWishlistClick = () => {
    if (isLogin) {
      router.push("/san-pham-yeu-thich");
      return;
    }

    router.push(buildAuthUrl("/dang-nhap"));
  };

  const handleOpenSearch = useCallback(() => {
    flushSync(() => setSearchOpen(true));
    searchRef.current?.focusInput();
  }, []);

  const renderTopBannerContent = () => {
    if (!resolvedBanner || !bannerText) return null;

    if (resolvedBanner.bannerDisplayStyle === "MEDIA" && resolvedBanner.bannerContent) {
      const media = (
        <Image
          src={resolvedBanner.bannerContent}
          alt={resolvedBanner.bannerName || "banner"}
          width={200}
          height={24}
          style={{ objectFit: "contain" }}
        />
      );
      return resolvedBanner.bannerTargetUrl ? <AppLink href={resolvedBanner.bannerTargetUrl}>{media}</AppLink> : media;
    }

    const textNode = <Typography variant="caption">{bannerText}</Typography>;
    return resolvedBanner.bannerTargetUrl ? (
      <AppLink href={resolvedBanner.bannerTargetUrl} variant="caption">
        {bannerText}
      </AppLink>
    ) : (
      textNode
    );
  };

  return (
    <Box ref={headerRef} component="header" className={classes.root} onMouseLeave={() => setHoveredCategory(null)}>
      {isTopBannerLoading ? <HeaderTopBannerSkeleton /> : null}
      {!isTopBannerLoading && showTopBanner ? (
        <Box className={classes.topBanner}>
          <Box className={topBannerItemClass}>{renderTopBannerContent()}</Box>
          <Box className={classes.closeButton} onClick={() => setVisible(false)}>
            <XClose size={20} strokeWidth={2.5} />
          </Box>
        </Box>
      ) : null}

      <Box sx={{ px: 2 }}>
        <StackRowAlignCenterJustBetween className={classes.headerMain}>
          <StackRowAlignCenter gap="8px">
            <AppLink href="/" className={classes.logo}>
              <Image src={logoSrc} alt="Logo" width={117} height={37} />
            </AppLink>

            {isPC && (
              <StackRowAlignCenter gap="20px" onMouseLeave={() => setHoveredCategory(null)}>
                {navigationItems.map((item) => {
                  const isActive = hoveredCategory ? hoveredCategory === item.id : activeNavigationRootId === item.id;

                  return (
                    <StackRowAlignCenter
                      key={item.id}
                      className={`${classes.menuItem} ${isActive ? classes.menuItemActive : ""}`}
                      onMouseEnter={() => setHoveredCategory(item.id)}
                      onClick={() => handleOpenMenu(item)}
                      sx={{ cursor: "pointer" }}
                    >
                      <Typography component="span">{item.label}</Typography>
                      <NavigationBadge badge={item.badge} />
                    </StackRowAlignCenter>
                  );
                })}
              </StackRowAlignCenter>
            )}
          </StackRowAlignCenter>

          <StackRowAlignCenter className={classes.headerRight}>
            {isPC && <HeaderMegaSearchTrigger open={searchOpen} onClick={handleOpenSearch} />}

            {!isPC && (
              <Box className={classes.iconButton} onClick={handleOpenSearch}>
                <SearchMd size={20} color="#333333" />
              </Box>
            )}

            {!isPC && <Box className={classes.verticalDivider} />}

            <StackRowAlignCenter className={classes.actionIcons}>
              {isPC && <Box className={classes.verticalDivider} />}

              <Box className={classes.iconButton} onClick={handleWishlistClick}>
                <Heart size={20} color="#333333" />
              </Box>

              <Box
                className={classes.iconButton}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  if (isLogin) {
                    if (isMobileHeader) {
                      router.push("/tai-khoan");
                    } else {
                      setIsUserDrawerOpen(true);
                    }
                  } else {
                    router.push(buildAuthUrl("/dang-nhap"));
                  }
                }}
              >
                {isHydrated && isLogin ? (
                  <Image src="/image/icons/icon-user-login.svg" alt="user" width={20} height={20} />
                ) : (
                  <User01 size={20} color="#333333" />
                )}
              </Box>

              <Box
                position="relative"
                className={cx(classes.iconButton, "shopping-cart")}
                onClick={() => {
                  if (pathname === "/gio-hang" || pathname === "/cart") {
                    return;
                  }
                  dispatch(openCartDrawer());
                }}
              >
                <Badge
                  badgeContent={isHydrated ? cartTotalQuantity || 0 : 0}
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "rgba(247, 209, 112, 1)",
                      color: "#000",
                    },
                  }}
                >
                  <ShoppingBag02 size={20} color="#333333" />
                </Badge>
              </Box>

              {!isPC && (
                <Box className={classes.iconButton} onClick={() => handleOpenMenu()}>
                  <Menu01 size={24} strokeWidth={2.3} color="#333333" />
                </Box>
              )}
            </StackRowAlignCenter>
          </StackRowAlignCenter>
        </StackRowAlignCenterJustBetween>
      </Box>

      <HeaderMegaMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchor={isPC ? "left" : "right"}
        isPC={isPC}
        navigationItems={navigationItems}
        selectedRootId={selectedRootId}
      />

      <HeaderMegaSearch ref={searchRef} open={searchOpen} onClose={() => setSearchOpen(false)} topOffset={headerHeight} />

      <CartDrawerComponent
        open={isCartDrawerOpen}
        onClose={() => dispatch(closeCartDrawer())}
        onCheckout={handleDrawerCheckout}
        isInitiatingCheckout={isInitiatingCheckout}
        onGoToCart={() => {
          dispatch(closeCartDrawer());
          router.push("/gio-hang");
        }}
      />
      <HeaderUserAccount
        user={user}
        anchorElUser={anchorElUser}
        setAnchorElUser={setAnchorElUser}
        isUserDrawerOpen={isUserDrawerOpen}
        setIsUserDrawerOpen={setIsUserDrawerOpen}
      />
    </Box>
  );
};

export default Header;
