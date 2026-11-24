"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { ButtonComponent } from "@/components/button/button.component";
import type { CtaBlockConfig, CtaButtonConfig } from "@/utils/api/cms/cms.interface";
import { CtaAlignment, CtaLinkTarget } from "@/utils/api/cms/cms.enum";
import {
  CTA_ALIGNMENT,
  CTA_COLOR_PATTERN,
  CTA_DEFAULTS,
  CTA_MAX_BUTTONS,
  CTA_URL_PATTERN,
} from "./cms-cta-block.constants";
import useStyles, { CTA_BUTTON_SX } from "./cms-cta-block.styles";

export function CmsCtaBlock({ config }: { config: CtaBlockConfig }) {
  const { classes } = useStyles();
  const alignment = CTA_ALIGNMENT[config.alignment ?? CtaAlignment.CENTER] ?? CTA_ALIGNMENT[CtaAlignment.CENTER];
  const hasTitle = Boolean(config.title?.trim());
  const buttons = (config.buttons ?? [])
    .filter((button) => button.label?.trim() && (!button.url?.trim() || CTA_URL_PATTERN.test(button.url.trim())))
    .slice(0, CTA_MAX_BUTTONS);
  const description = config.description?.trim();
  const bottomText = config.bottomText?.trim();
  const radius = config.background?.borderRadius;
  if (!hasTitle && !description && !bottomText && !buttons.length) return null;
  return (
    <Box
      component="section"
      className={classes.root}
      sx={{
        ...alignment,
        bgcolor: resolveCtaColor(config.background?.color, CTA_DEFAULTS.backgroundColor),
        border: "1px solid",
        borderColor: resolveCtaColor(config.background?.borderColor, CTA_DEFAULTS.borderColor),
        borderRadius: `${typeof radius === "number" && Number.isFinite(radius) && radius >= 0 ? radius : CTA_DEFAULTS.borderRadius}px`,
      }}
    >
      <CtaHeader config={config} />
      <CtaActions config={config} buttons={buttons} />
    </Box>
  );
}

function CtaHeader({ config }: { config: CtaBlockConfig }) {
  const { classes } = useStyles();
  const hasTitle = Boolean(config.title?.trim());
  const description = config.description?.trim();
  if (!hasTitle && !description) return null;
  return (
    <Box className={classes.header} sx={{ alignItems: "inherit" }}>
      {hasTitle ? (
        <Typography
          component="h2"
          className={classes.title}
          sx={{ color: resolveCtaColor(config.titleColor, CTA_DEFAULTS.textColor) }}
        >
          {config.title?.trim()}
        </Typography>
      ) : null}
      {description ? (
        <Typography
          className={classes.description}
          sx={{ color: resolveCtaColor(config.descriptionColor, CTA_DEFAULTS.textColor) }}
        >
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}

function CtaActions({ config, buttons }: { config: CtaBlockConfig; buttons: CtaButtonConfig[] }) {
  const { classes } = useStyles();
  const bottomText = config.bottomText?.trim();
  if (!buttons.length && !bottomText) return null;
  return (
    <Box className={classes.actions}>
      <CtaButtons buttons={buttons} />
      {bottomText ? (
        <Typography className={classes.bottomText} sx={{ color: resolveCtaColor(config.bottomTextColor, CTA_DEFAULTS.textColor) }}>
          {bottomText}
        </Typography>
      ) : null}
    </Box>
  );
}

function CtaButtons({ buttons }: { buttons: CtaButtonConfig[] }) {
  const { classes } = useStyles();
  if (!buttons.length) return null;
  return (
    <Box className={classes.buttons} sx={{ width: { xs: buttons.length > 1 ? "100%" : "auto", sm: "auto" } }}>
      {buttons.map((button, index) => (
        <CtaButton key={`${button.url}-${index}`} config={button} />
      ))}
    </Box>
  );
}

function CtaButton({ config }: { config: CtaButtonConfig }) {
  const label = config.label?.trim() ?? "";
  const url = config.url?.trim();
  const backgroundColor = resolveCtaColor(config.backgroundColor, CTA_DEFAULTS.textColor);
  const sx = {
    ...CTA_BUTTON_SX,
    cursor: url ? "pointer" : "default",
    bgcolor: backgroundColor,
    color: resolveCtaColor(config.textColor, CTA_DEFAULTS.buttonTextColor),
    borderColor: resolveCtaColor(config.borderColor, CTA_DEFAULTS.textColor),
    "&:hover": { bgcolor: backgroundColor, borderColor: resolveCtaColor(config.borderColor, CTA_DEFAULTS.textColor) },
  };
  if (!url) {
    return <ButtonComponent content={label} disableElevation variant="contained" sx={sx} />;
  }
  const openInNewTab = config.target === CtaLinkTarget.BLANK;
  const linkProps = {
    href: url,
    ...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {}),
  };
  const isInternal = url.startsWith("/") && !url.startsWith("//");
  if (isInternal && !openInNewTab) {
    return (
      <Button component={Link} {...linkProps} disableElevation variant="contained" sx={sx}>
        <Typography>{label}</Typography>
      </Button>
    );
  }
  return (
    <Button component="a" {...linkProps} disableElevation variant="contained" sx={sx}>
      <Typography>{label}</Typography>
    </Button>
  );
}

function resolveCtaColor(value: string | undefined, fallback: string): string {
  return value && CTA_COLOR_PATTERN.test(value) ? value : fallback;
}

export default CmsCtaBlock;