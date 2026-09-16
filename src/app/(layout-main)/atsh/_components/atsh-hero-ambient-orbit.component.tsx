"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ATSH_HERO_MOTION } from "../_constants/atsh-hero-motion.constants";

type AtshHeroAmbientOrbitProps = {
  orbitRadius: number;
  className?: string;
  layerSize?: number;
};

const AtshHeroAmbientOrbit = ({ orbitRadius, className, layerSize }: AtshHeroAmbientOrbitProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { particle, glowRing } = ATSH_HERO_MOTION;

  if (prefersReducedMotion) {
    return null;
  }

  const radius = orbitRadius * particle.orbitRadiusFactor;
  const glowSize = orbitRadius * glowRing.sizeFactor;
  const containerSize = layerSize ?? orbitRadius * 2.8;

  const particles = Array.from({ length: particle.count }, (_, i) => ({
    angle: (i * 360) / particle.count,
    delay: i * particle.delayStep,
  }));

  return (
    <div className={className} style={{ width: containerSize, height: containerSize }} aria-hidden>
      {particles.map((p, index) => {
        const x = Math.cos((p.angle * Math.PI) / 180) * radius;
        const y = Math.sin((p.angle * Math.PI) / 180) * radius;

        return (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0.8, 1],
              opacity: [0, 0.6, 0.3, 0.6],
              x: [0, x * 0.5, x, x * 0.5, 0],
              y: [0, y * 0.5, y, y * 0.5, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: p.delay + particle.baseDelay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "radial-gradient(circle, #FFFFFF, transparent)",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </div>
  );
};

export default AtshHeroAmbientOrbit;
