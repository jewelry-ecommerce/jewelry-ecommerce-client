"use client";

import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { ATSH_HERO_MOTION, ATSH_HERO_SECTION_ID } from "../_constants/atsh-hero-motion.constants";
import { useAtshHeroExit } from "../_hooks/use-atsh-hero-exit.hook";
import {
  resolveAtshExploreCta,
  isAtshExploreInPageScrollHref,
  resolveAtshHeroContent,
  resolveAtshSpiralProductsCta,
} from "../_utils/atsh-brothers.util";
import { useAtshBrothersData } from "./atsh-brothers.provider";
import AtshCollabLogos from "./atsh-collab-logos.component";
import AtshHeroAmbientOrbit from "./atsh-hero-ambient-orbit.component";
import AtshCtaButton from "./atsh-cta-button.component";
import AtshHeroHeadline from "./atsh-hero-headline.component";
import useAtshStyles from "./atsh.styles";

const MotionSection = motion.create(Box);

type AtshHeroSectionProps = {
  contentViewportHeight?: string;
};

const AtshHeroSection = ({ contentViewportHeight }: AtshHeroSectionProps) => {
  const { classes, cx } = useAtshStyles();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const prefersReducedMotion = useReducedMotion();
  const { handleExploreClick } = useAtshHeroExit();
  const brothersData = useAtshBrothersData();
  const productsCta = useMemo(() => resolveAtshSpiralProductsCta(brothersData), [brothersData]);
  const exploreCta = useMemo(() => resolveAtshExploreCta(brothersData), [brothersData]);
  const exploreIsInPageScroll = isAtshExploreInPageScrollHref(exploreCta.href);
  const heroContent = useMemo(() => resolveAtshHeroContent(brothersData), [brothersData]);
  const [isHeroInView, setIsHeroInView] = useState(true);

  const orbitRadius = isMdUp ? ATSH_HERO_MOTION.orbitRadius.desktop : ATSH_HERO_MOTION.orbitRadius.mobile;
  const orbitLayerSize = orbitRadius * ATSH_HERO_MOTION.orbitLayerSizeMultiplier;
  const { logoEntrance, logoFloat, taglineEntrance, ctaEntrance } = ATSH_HERO_MOTION;

  return (
    <MotionSection
      component="section"
      id={ATSH_HERO_SECTION_ID}
      className={classes.heroSection}
      aria-label="Heartlock x Anh Trai Say Hi"
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...(contentViewportHeight
          ? { height: contentViewportHeight, minHeight: contentViewportHeight, maxHeight: contentViewportHeight }
          : {}),
      }}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      onViewportEnter={() => setIsHeroInView(true)}
    >
      <Box className={classes.heroInner} sx={contentViewportHeight ? { height: "100%" } : undefined}>
        <Box className={classes.heroOrbitStage}>
          <Box className={classes.heroContentBlock}>
            <Box className={classes.heroLogosStage}>
              <motion.div
                className={classes.heroLogosFloat}
                initial={prefersReducedMotion ? false : { scale: 0.3, opacity: 0, y: -50 }}
                animate={
                  prefersReducedMotion ? undefined : isHeroInView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.3, opacity: 0, y: -50 }
                }
                transition={
                  prefersReducedMotion
                    ? undefined
                    : {
                        duration: logoEntrance.duration,
                        ease: logoEntrance.ease,
                        delay: logoEntrance.delay,
                      }
                }
              >
                <motion.div
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : {
                          y: [0, -15, 0],
                          rotateZ: [0, 2, 0, -2, 0],
                        }
                  }
                  transition={
                    prefersReducedMotion
                      ? undefined
                      : {
                          duration: logoFloat.duration,
                          repeat: Infinity,
                          ease: logoFloat.ease,
                        }
                  }
                >
                  <AtshCollabLogos />
                </motion.div>
              </motion.div>
            </Box>

            <Box className={classes.heroTextStack}>
              {heroContent.headline || heroContent.title ? (
                <AtshHeroHeadline
                  text={heroContent.headline || heroContent.title || ""}
                  subHeadline={heroContent.headline ? heroContent.title : undefined}
                  isVisible={isHeroInView}
                />
              ) : null}
              <Box className={classes.heroOrbitAnchor} aria-hidden>
                {isHeroInView ? (
                  <AtshHeroAmbientOrbit orbitRadius={orbitRadius} layerSize={orbitLayerSize} className={classes.heroOrbitAmbientLayer} />
                ) : null}
              </Box>
              {heroContent.description ? (
                <Box className={classes.heroTaglineWrap}>
                  <motion.div
                    initial={prefersReducedMotion ? false : { y: 30, opacity: 0, scale: taglineEntrance.initialScale }}
                    animate={
                      prefersReducedMotion
                        ? undefined
                        : isHeroInView
                          ? { y: 0, opacity: 1, scale: 1 }
                          : { y: 30, opacity: 0, scale: taglineEntrance.initialScale }
                    }
                    transition={
                      prefersReducedMotion
                        ? undefined
                        : {
                            duration: taglineEntrance.duration,
                            delay: taglineEntrance.delay,
                            ease: taglineEntrance.ease,
                          }
                    }
                  >
                    <Typography className={classes.tagline}>{heroContent.description}</Typography>
                  </motion.div>
                </Box>
              ) : null}
            </Box>
          </Box>

          <Box className={classes.ctaRow}>
            <AtshCtaButton
              label={productsCta.label}
              href={productsCta.href}
              wrapClassName={classes.ctaButtonWrap}
              className={cx(classes.ctaButton, classes.ctaPrimary)}
              entrance={{ isInView: isHeroInView, delay: ctaEntrance.delay }}
            />

            <AtshCtaButton
              label={exploreCta.label}
              href={exploreIsInPageScroll && exploreCta.href ? `#${exploreCta.href.split("#").pop()}` : exploreCta.href}
              labelVariant="secondary"
              wrapClassName={classes.ctaButtonWrap}
              className={cx(classes.ctaButton, classes.ctaSecondary)}
              entrance={{ isInView: isHeroInView, delay: 1.4 }}
              onClick={exploreIsInPageScroll ? handleExploreClick : undefined}
            />
          </Box>
        </Box>
      </Box>
    </MotionSection>
  );
};

export default AtshHeroSection;
