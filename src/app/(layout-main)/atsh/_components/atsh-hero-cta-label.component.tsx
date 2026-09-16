"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ATSH_HERO_MOTION } from "../_constants/atsh-hero-motion.constants";
import useAtshStyles from "./atsh.styles";

type AtshHeroCtaLabelProps = {
  text: string;
  isHovering: boolean;
  variant: "primary" | "secondary";
};

const AtshHeroCtaLabel = ({ text, isHovering, variant }: AtshHeroCtaLabelProps) => {
  const { classes } = useAtshStyles();
  const prefersReducedMotion = useReducedMotion();
  const { ctaLabelHover } = ATSH_HERO_MOTION;
  const weight = ctaLabelHover[variant];

  if (prefersReducedMotion) {
    return <span className={classes.ctaLabel}>{text}</span>;
  }

  return (
    <span className={classes.ctaLabel}>
      {text.split("").map((char, index) => (
        <motion.span
          key={`${index}-${char}`}
          className={classes.ctaLabelChar}
          animate={{
            y: isHovering ? [0, ctaLabelHover.yOffset, 0] : 0,
            fontWeight: isHovering ? [weight.fontWeightFrom, weight.fontWeightTo, weight.fontWeightFrom] : weight.fontWeightFrom,
          }}
          transition={{
            duration: ctaLabelHover.duration,
            delay: index * ctaLabelHover.charDelayStep,
            ease: ctaLabelHover.ease,
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

export default AtshHeroCtaLabel;
