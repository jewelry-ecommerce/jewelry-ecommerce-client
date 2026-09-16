"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ATSH_HERO_MOTION } from "../_constants/atsh-hero-motion.constants";
import AtshTypography from "./atsh-typography.component";
import useAtshStyles from "./atsh.styles";

type AtshHeroHeadlineProps = {
  text: string;
  subHeadline?: string;
  isVisible?: boolean;
};

function AtshHeroHeadlineLine({
  lineText,
  className,
  wordDelayOffset,
  isVisible,
}: {
  lineText: string;
  className?: string;
  wordDelayOffset: number;
  isVisible: boolean;
}) {
  const { classes, cx } = useAtshStyles();
  const prefersReducedMotion = useReducedMotion();
  const { headlineEntrance } = ATSH_HERO_MOTION;
  const words = lineText.trim().split(/\s+/).filter(Boolean);

  if (prefersReducedMotion) {
    return <span className={cx(classes.heroHeadlineLine, className)}>{lineText.trim()}</span>;
  }

  return (
    <span className={cx(classes.heroHeadlineLine, className)}>
      {words.map((word, index) => (
        <motion.span
          key={`${wordDelayOffset + index}-${word}`}
          className={classes.heroHeadlineWord}
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: headlineEntrance.charDuration,
            delay: headlineEntrance.delay + (wordDelayOffset + index) * headlineEntrance.wordDelayStep,
            ease: "easeOut",
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

const AtshHeroHeadline = ({ text, subHeadline, isVisible = true }: AtshHeroHeadlineProps) => {
  const { classes } = useAtshStyles();
  const headlineWords = text.trim().split(/\s+/).filter(Boolean);
  const ariaLabel = [text.trim(), subHeadline?.trim()].filter(Boolean).join(" ");

  return (
    <AtshTypography component="h2" className={classes.heroHeadline} aria-label={ariaLabel}>
      <AtshHeroHeadlineLine lineText={text} wordDelayOffset={0} isVisible={isVisible} />
      {subHeadline ? (
        <AtshHeroHeadlineLine
          lineText={subHeadline}
          className={classes.heroTitleSubHeadline}
          wordDelayOffset={headlineWords.length}
          isVisible={isVisible}
        />
      ) : null}
    </AtshTypography>
  );
};

export default AtshHeroHeadline;
