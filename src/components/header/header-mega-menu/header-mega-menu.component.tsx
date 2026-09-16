import React, { useEffect, useMemo, useState } from "react";
import { Drawer, Box, Typography, Stack } from "@mui/material";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import useStyles from "./header-mega-menu.styles";
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled/stack.style";
import { ArrowNarrowRight, XClose } from "@untitledui/icons";
import type { StorefrontNavigationBadge, StorefrontNavigationItem } from "@/utils/api/cms";
import { buildNavigationHref, isExternalNavigationHref, isNavigationItemActive } from "@/utils/api/cms";
import { useLogoSrc } from "@/components/providers.component";
import { RemoveScroll } from "react-remove-scroll";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

interface HeaderMegaMenuProps {
  open: boolean;
  onClose: () => void;
  anchor: "left" | "right";
  isPC: boolean;
  navigationItems?: StorefrontNavigationItem[];
  selectedRootId?: string | null;
}

export const NavigationBadge = ({ badge, compact = false }: { badge: StorefrontNavigationBadge | null | undefined; compact?: boolean }) => {
  if (!badge) return null;

  if (badge.designType === "IMAGE" && badge.imageUrl) {
    return (
      <Box
        component="img"
        src={badge.imageUrl}
        alt=""
        sx={{ maxWidth: 42, maxHeight: compact ? 18 : 20, objectFit: "contain", ml: 0.5, flexShrink: 0 }}
      />
    );
  }

  if (!badge.displayText) return null;

  return (
    <Box
      component="span"
      sx={{
        ml: 0.5,
        px: 0.75,
        py: 0.15,
        borderRadius: "999px",
        flexShrink: 0,
        bgcolor: String(badge.styleConfig?.backgroundColor || "#E53935"),
        color: String(badge.styleConfig?.color || "#FFFFFF"),
        ...(compact
          ? { fontSize: 10, fontWeight: 700, lineHeight: 1.4 }
          : { ...TYPOGRAPHY_STYLES.sm.bold, fontSize: "12px", lineHeight: 1.4 }),
      }}
    >
      {badge.displayText}
    </Box>
  );
};

const HeaderMegaMenu = ({ open, onClose, anchor, isPC, navigationItems = [], selectedRootId }: HeaderMegaMenuProps) => {
  const logoSrc = useLogoSrc();
  const router = useRouter();
  const pathname = usePathname();
  const { classes, cx } = useStyles();
  const [activeRootId, setActiveRootId] = useState<string | null>(null);
  const [activeLevel2Id, setActiveLevel2Id] = useState<string | null>(null);
  const [activeLevel3Id, setActiveLevel3Id] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setActiveRootId(null);
      setActiveLevel2Id(null);
      setActiveLevel3Id(null);
      return;
    }

    if (selectedRootId) {
      setActiveRootId(selectedRootId);
      return;
    }

    const activeRootItem = navigationItems.find((item) => isNavigationItemActive(item, { pathname, checkChildren: true }));
    setActiveRootId(activeRootItem?.id ?? null);
  }, [navigationItems, open, pathname, selectedRootId]);

  const activeRoot = useMemo(
    () => navigationItems.find((item) => item.id === activeRootId) ?? navigationItems[0] ?? null,
    [activeRootId, navigationItems],
  );

  const level2Items = useMemo(() => activeRoot?.children ?? [], [activeRoot?.children]);
  const activeLevel2 = useMemo(() => level2Items.find((item) => item.id === activeLevel2Id) ?? null, [activeLevel2Id, level2Items]);
  const level3Items = useMemo(() => activeLevel2?.children ?? [], [activeLevel2?.children]);

  useEffect(() => {
    const activeChild = level2Items.find((item) => isNavigationItemActive(item, { pathname, checkChildren: true }));
    setActiveLevel2Id(activeChild?.id ?? null);
  }, [activeRoot?.id, level2Items, pathname]);

  useEffect(() => {
    const activeChild = level3Items.find((item) => isNavigationItemActive(item, { pathname }));
    setActiveLevel3Id(activeChild?.id ?? null);
  }, [activeLevel2?.id, level3Items, pathname]);

  const navigateToNavigationItem = (item: StorefrontNavigationItem) => {
    const href = buildNavigationHref(item);
    if (!href) return;

    onClose();
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

  const getViewAllLabel = (item: StorefrontNavigationItem): string => item.viewAllLabel ?? `Tất cả ${item.label}`;

  const shouldShowViewAllLink = (item: StorefrontNavigationItem | null): item is StorefrontNavigationItem =>
    Boolean(item?.children?.length && (item.viewAllLabel || buildNavigationHref(item)));

  const handleRootClick = (item: StorefrontNavigationItem) => {
    if (!item.children?.length) {
      navigateToNavigationItem(item);
      return;
    }

    setActiveRootId(item.id);
  };

  const renderNavigationList = (
    items: StorefrontNavigationItem[],
    selectedId: string | null,
    onSelect: (item: StorefrontNavigationItem) => void,
  ) =>
    items.map((item) => {
      const isActive = selectedId === item.id;
      const hasChildren = item.children?.length > 0;

      return (
        <StackRowAlignCenter key={item.id} className={classes.categoryItem} onClick={() => onSelect(item)}>
          <Typography
            className={cx(classes.categoryText, {
              [classes.categoryTextActive]: isActive,
            })}
          >
            {item.label}
          </Typography>
          <NavigationBadge badge={item.badge} compact />
          {hasChildren && isActive ? <ArrowNarrowRight size={20} color="#000" /> : null}
        </StackRowAlignCenter>
      );
    });

  const renderViewAll = () => {
    if (!activeRoot) {
      return <Typography className={classes.subHeaderTitle}>Tất cả sản phẩm</Typography>;
    }

    const label = getViewAllLabel(activeRoot);
    const href = buildNavigationHref(activeRoot);

    if (!href) {
      return <Typography className={classes.subHeaderTitle}>{label}</Typography>;
    }

    return (
      <Typography className={classes.subHeaderTitle} onClick={() => navigateToNavigationItem(activeRoot)} sx={{ cursor: "pointer" }}>
        {label}
      </Typography>
    );
  };

  const renderLevel2ViewAll = () => {
    if (!shouldShowViewAllLink(activeLevel2)) {
      return null;
    }

    const label = getViewAllLabel(activeLevel2);

    return (
      <StackRowAlignCenter className={classes.categoryItem} onClick={() => navigateToNavigationItem(activeLevel2)}>
        <Typography className={cx(classes.categoryText, classes.categoryTextActive)}>{label}</Typography>
      </StackRowAlignCenter>
    );
  };

  const renderNavigationGrid = (withScrollContainer = false) => (
    <Box className={cx(classes.gridContainer, withScrollContainer && classes.scrollContainer)}>
      <Stack className={cx(classes.gridColumn)}>
        {renderNavigationList(level2Items, activeLevel2?.id ?? null, (item) => {
          if (item.children?.length) {
            setActiveLevel2Id(item.id);
            return;
          }
          navigateToNavigationItem(item);
        })}
      </Stack>
      <Stack className={cx(classes.gridColumn)}>
        {renderLevel2ViewAll()}
        {renderNavigationList(level3Items, activeLevel3Id, (item) => navigateToNavigationItem(item))}
      </Stack>
    </Box>
  );

  const renderTopNavigation = () => (
    <StackRowAlignCenter gap={3}>
      {navigationItems.map((item) => (
        <StackRowAlignCenter
          key={item.id}
          className={classes.pcMenuLink}
          onClick={() => handleRootClick(item)}
          sx={{ cursor: "pointer", flexShrink: 0 }}
        >
          <Typography component="span" className={cx({ [classes.categoryTextActive]: activeRoot?.id === item.id })}>
            {item.label}
          </Typography>
          <NavigationBadge badge={item.badge} />
        </StackRowAlignCenter>
      ))}
    </StackRowAlignCenter>
  );
  const renderPCContent = () => (
    <Stack className={classes.contentContainer}>
      <StackRowAlignCenterJustBetween gap={3}>
        <Box onClick={onClose} sx={{ cursor: "pointer", display: "flex", "& img": { display: "block" } }}>
          <Image src={logoSrc} alt="Logo" width={100} height={30} />
        </Box>
        {renderTopNavigation()}
      </StackRowAlignCenterJustBetween>

      <StackRowAlignCenterJustBetween>
        {renderViewAll()}
        <Box className={classes.closeBtn} onClick={onClose}>
          <XClose size={24} color="#000" />
        </Box>
      </StackRowAlignCenterJustBetween>

      <RemoveScroll enabled={open} forwardProps>
        {renderNavigationGrid(true)}
      </RemoveScroll>
    </Stack>
  );

  const renderMobileContent = () => (
    <Stack className={classes.contentContainer}>
      <StackRowAlignCenterJustBetween>
        <Box onClick={onClose} className={classes.closeBtn} sx={{ display: "flex", "& img": { display: "block" } }}>
          <Image src={logoSrc} alt="Logo" width={100} height={30} />
        </Box>
        <Box className={classes.closeBtn} onClick={onClose}>
          <XClose size={24} color="#000" />
        </Box>
      </StackRowAlignCenterJustBetween>

      <RemoveScroll enabled={open} forwardProps>
        <Box className={classes.mobileScrollArea}>
          <StackRow className={classes.mobileMenuNav}>
            {navigationItems.map((item) => (
              <StackRowAlignCenter
                key={item.id}
                className={classes.pcMenuLink}
                onClick={() => handleRootClick(item)}
                sx={{ cursor: "pointer", flexShrink: 0 }}
              >
                <Typography component="span" className={cx({ [classes.categoryTextActive]: activeRoot?.id === item.id })}>
                  {item.label}
                </Typography>
                <NavigationBadge badge={item.badge} />
              </StackRowAlignCenter>
            ))}
          </StackRow>
          <StackRowAlignCenterJustBetween>{renderViewAll()}</StackRowAlignCenterJustBetween>

          <Box className={classes.scrollContainer}>{renderNavigationGrid()}</Box>
        </Box>
      </RemoveScroll>
    </Stack>
  );

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      transitionDuration={300}
      PaperProps={{
        className: isPC ? classes.drawerPaperPC : classes.drawerPaperMobile,
      }}
      ModalProps={{ disableScrollLock: true }}
      sx={{ zIndex: 1301 }}
    >
      {isPC ? renderPCContent() : renderMobileContent()}
    </Drawer>
  );
};

export default HeaderMegaMenu;
