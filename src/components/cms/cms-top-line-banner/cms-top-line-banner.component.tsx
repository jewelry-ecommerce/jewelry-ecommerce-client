"use client";

import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { XClose } from "@untitledui/icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BlockConfig } from "@/utils/api/cms/cms.interface";
import { ActionType, AnimationType } from "@/utils/api/cms/cms.enum";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { CTA_COLOR_PATTERN } from "@/components/cms/cms-cta-block/cms-cta-block.constants";

const marqueeKeyframes = keyframes({
  "0%": { transform: "translateX(0)" },
  "100%": { transform: "translateX(-100%)" },
});

const dismissStorageKey = (blockId: string) => `cms-top-line-banner-dismissed:${blockId}`;

const resolveColor = (value: string | undefined, fallback: string): string =>
  value && CTA_COLOR_PATTERN.test(value) ? value : fallback;

export function CmsTopLineBanner({ blockId, config }: { blockId: string; config: BlockConfig }) {
  const [visible, setVisible] = useState(true);
  const settings = config.settings;
  const isClosable = settings?.isClosable ?? true;

  useEffect(() => {
    if (!isClosable || typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem(dismissStorageKey(blockId)) === "1") {
      setVisible(false);
    }
  }, [blockId, isClosable]);

  const lineTexts = useMemo(
    () => (config.items ?? []).map((item) => item.text?.trim()).filter(Boolean) as string[],
    [config.items],
  );
  const badgeText = config.badge?.text?.trim();

  if (!visible || (!lineTexts.length && !badgeText)) return null;

  const bgColor = resolveColor(settings?.backgroundColor, "#000000");
  const textColor = resolveColor(settings?.textColor, "#FFFFFF");
  const animationType = settings?.animationType ?? AnimationType.STATIC;
  const animationSpeed = Math.max(settings?.animationSpeed ?? 10, 3);

  const handleClose = () => {
    setVisible(false);
    if (isClosable && typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(dismissStorageKey(blockId), "1");
    }
  };

  return (
    <Box
      component="aside"
      role="region"
      aria-label="Thông báo"
      sx={{
        width: "100%",
        bgcolor: bgColor,
        color: textColor,
        minHeight: 36,
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 0.75,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <TopLineBadge badge={config.badge} />
      <TopLineContent texts={lineTexts} items={config.items ?? []} animationType={animationType} animationSpeed={animationSpeed} textColor={textColor} />
      {isClosable ? (
        <IconButton size="small" aria-label="Đóng" onClick={handleClose} sx={{ color: "inherit", ml: "auto", flexShrink: 0 }}>
          <XClose width={18} height={18} />
        </IconButton>
      ) : null}
    </Box>
  );
}

function TopLineBadge({ badge }: { badge: BlockConfig["badge"] }) {
  const text = badge?.text?.trim();
  if (!text) return null;
  const badgeBody = (
    <Typography
      component="span"
      sx={{
        ...TYPOGRAPHY_STYLES.xs.bold,
        color: resolveColor(badge?.textColor, "#FFFFFF"),
        bgcolor: resolveColor(badge?.backgroundColor, "#F59E0B"),
        px: 1,
        py: 0.25,
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </Typography>
  );
  if (badge?.actionType === ActionType.LINK && badge.actionUrl?.trim()) {
    return (
      <Link href={badge.actionUrl.trim()} style={{ textDecoration: "none", color: "inherit" }}>
        {badgeBody}
      </Link>
    );
  }
  return badgeBody;
}

function TopLineContent({
  texts,
  items,
  animationType,
  animationSpeed,
  textColor,
}: {
  texts: string[];
  items: NonNullable<BlockConfig["items"]>;
  animationType: AnimationType | string;
  animationSpeed: number;
  textColor: string;
}) {
  const combined = texts.join(" · ");
  if (!combined) return null;

  if (animationType === AnimationType.MARQUEE) {
    return (
      <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden", pr: 1 }}>
        <Box
          sx={{
            display: "inline-block",
            whiteSpace: "nowrap",
            pl: "100%",
            animation: `${marqueeKeyframes} ${animationSpeed}s linear infinite`,
          }}
        >
          <TopLineTextRow items={items} fallbackText={combined} textColor={textColor} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5, pr: 1 }}>
      <TopLineTextRow items={items} fallbackText={combined} textColor={textColor} />
    </Box>
  );
}

function TopLineTextRow({
  items,
  fallbackText,
  textColor,
}: {
  items: NonNullable<BlockConfig["items"]>;
  fallbackText: string;
  textColor: string;
}) {
  const segments = items.filter((item) => item.text?.trim());
  if (!segments.length) {
    return (
      <Typography component="span" sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: textColor }}>
        {fallbackText}
      </Typography>
    );
  }
  return (
    <>
      {segments.map((item, index) => (
        <TopLineSegment key={`${item.text}-${index}`} text={item.text!.trim()} actionType={item.actionType} actionUrl={item.actionUrl} textColor={textColor} showSeparator={index < segments.length - 1} />
      ))}
    </>
  );
}

function TopLineSegment({
  text,
  actionType,
  actionUrl,
  textColor,
  showSeparator,
}: {
  text: string;
  actionType?: string;
  actionUrl?: string;
  textColor: string;
  showSeparator: boolean;
}) {
  const body = (
    <Typography component="span" sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: textColor, whiteSpace: "nowrap" }}>
      {text}
      {showSeparator ? " · " : ""}
    </Typography>
  );
  const url = actionUrl?.trim();
  if (actionType === ActionType.LINK && url) {
    return (
      <Link href={url} style={{ textDecoration: "underline", color: "inherit" }}>
        {body}
      </Link>
    );
  }
  return body;
}

export default CmsTopLineBanner;