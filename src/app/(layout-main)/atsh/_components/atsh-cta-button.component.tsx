"use client";

import type { ElementType, MouseEvent, PointerEvent } from "react";
import AppLink from "@/components/app-link/app-link.component";
import { Box, Button } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { ATSH_CTA_BUTTON_BACKGROUND } from "../_constants/atsh.constants";
import { ATSH_HERO_MOTION } from "../_constants/atsh-hero-motion.constants";
import AtshHeroCtaLabel from "./atsh-hero-cta-label.component";

type AtshCtaButtonEntrance = {
  isInView: boolean;
  delay?: number;
};

export type AtshCtaButtonProps = {
  label: string;
  href: string;
  className?: string;
  wrapClassName?: string;
  component?: ElementType;
  onClick?: (e: MouseEvent<HTMLElement> | PointerEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void;
  disableElevation?: boolean;
  variant?: "text" | "outlined" | "contained";
  labelVariant?: "primary" | "secondary";
  entrance?: AtshCtaButtonEntrance;
};

const AtshCtaButton = ({
  label,
  href,
  className,
  wrapClassName,
  component = AppLink,
  onClick,
  disableElevation = true,
  labelVariant = "primary",
  entrance,
}: AtshCtaButtonProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const lastInPageActivateAtRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();
  const { ctaHover, ctaEntrance } = ATSH_HERO_MOTION;

  const hasEntrance = Boolean(entrance);
  const entranceDelay = entrance?.delay ?? ctaEntrance.delay;
  const backgroundSrc = ATSH_CTA_BUTTON_BACKGROUND[labelVariant];
  const borderRadius = ctaHover.borderRadius;
  const isInPageScrollAction = Boolean(onClick) && href.startsWith("#");
  const buttonComponent = isInPageScrollAction ? "button" : component;

  function handleInPageActivate(e: MouseEvent<HTMLElement> | PointerEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) {
    if (!isInPageScrollAction || !onClick) return;

    const now = Date.now();
    if (now - lastInPageActivateAtRef.current < 400) return;
    lastInPageActivateAtRef.current = now;

    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  }

  function handleInPagePointerUp(e: PointerEvent<HTMLElement>) {
    if (!isInPageScrollAction || !onClick || e.button !== 0) return;
    handleInPageActivate(e);
  }

  function handleInPageClick(e: MouseEvent<HTMLElement>) {
    if (!isInPageScrollAction || !onClick) return;
    if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType === "touch") return;
    handleInPageActivate(e);
  }

  function handleInPageKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (!isInPageScrollAction || !onClick) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    handleInPageActivate(e);
  }

  return (
    <motion.div
      className={wrapClassName}
      initial={hasEntrance && !prefersReducedMotion ? { scale: ctaEntrance.initialScale, opacity: 0 } : false}
      animate={
        hasEntrance && !prefersReducedMotion
          ? entrance?.isInView
            ? { scale: 1, opacity: 1 }
            : { scale: ctaEntrance.initialScale, opacity: 0 }
          : undefined
      }
      transition={
        hasEntrance && !prefersReducedMotion
          ? {
              duration: ctaEntrance.duration,
              delay: entranceDelay,
              ease: ctaEntrance.ease,
            }
          : undefined
      }
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              scale: ctaHover.scale,
              filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.45))",
              transition: { duration: ctaHover.hoverTransitionDuration },
            }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: ctaHover.tapScale }}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "stretch",
        isolation: "isolate",
        filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.32))",
      }}
    >
      <Box
        component="img"
        src={backgroundSrc}
        alt=""
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius,
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <motion.div
          animate={{
            x: isHovering && !prefersReducedMotion ? ["-100%", "100%"] : "-100%",
          }}
          transition={{
            duration: ctaHover.shimmerDuration,
            delay: 0,
            ease: ctaHover.shimmerEase,
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: ctaHover.shimmerGradient,
            pointerEvents: "none",
          }}
        />
      </Box>
      <Button
        component={buttonComponent}
        {...(isInPageScrollAction ? { type: "button" as const } : { href })}
        variant="text"
        disableElevation={disableElevation}
        className={className}
        onClick={isInPageScrollAction ? handleInPageClick : onClick}
        onPointerUp={isInPageScrollAction ? handleInPagePointerUp : undefined}
        onKeyDown={isInPageScrollAction ? handleInPageKeyDown : undefined}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        sx={{
          position: "relative",
          zIndex: 1,
          minHeight: 0,
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          backgroundColor: "transparent",
          backgroundImage: "none",
          boxShadow: "none",
          border: "none",
          "&:hover": {
            backgroundColor: "transparent",
            backgroundImage: "none",
            boxShadow: "none",
          },
          "&.MuiButton-text": {
            backgroundColor: "transparent",
          },
          "&.MuiButton-contained": {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <AtshHeroCtaLabel text={label} isHovering={isHovering} variant={labelVariant} />
      </Button>
    </motion.div>
  );
};

export default AtshCtaButton;
