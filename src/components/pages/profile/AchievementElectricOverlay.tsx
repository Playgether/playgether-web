"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { rarityConfig, type RarityLevel } from "./rarityConfig";
import {
  buildElectricSparks,
  electricSparkColorForRarity,
  type ElectricSparkData,
} from "./achievementElectricSparks";

function ElectricSpark({
  spark,
  isHovered,
  color,
  expandedBoost,
}: {
  spark: ElectricSparkData;
  isHovered: boolean;
  color: string;
  expandedBoost: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none z-[1]"
      style={{
        left: `${spark.x}%`,
        top: `${spark.y}%`,
        width: isHovered ? "30px" : "18px",
        height: "1.5px",
        background: color,
        filter: `blur(0.5px) drop-shadow(0 0 3px ${color})`,
        rotate: spark.rotation,
        originX: "0%",
        willChange: "opacity, scaleX",
      }}
      animate={{
        opacity: [0, expandedBoost, 0.65 * expandedBoost, 0],
        scaleX: [0, 1, 0.85, 0],
      }}
      transition={{
        duration: spark.duration,
        delay: spark.delay,
        repeat: Infinity,
        repeatDelay: spark.repeatDelay,
        ease: "easeOut",
      }}
    />
  );
}

/** Raios de fundo (Lendário / Celestial) — modal, cards expandidos, etc. */
export function AchievementElectricOverlay({
  rarity,
  isHovered = true,
  isExpanded = false,
  clipClassName = "rounded-[calc(var(--radius)-1.5px)]",
}: {
  rarity: RarityLevel;
  isHovered?: boolean;
  isExpanded?: boolean;
  clipClassName?: string;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const config = rarityConfig[rarity];
  const sparks = useMemo(
    () => buildElectricSparks(config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rarity],
  );

  if (reducedMotion || !config.hasElectricEffect) return null;

  const color = electricSparkColorForRarity(rarity);
  const expandedBoost = isExpanded ? 1.2 : 1;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${clipClassName}`}
    >
      {sparks.map((s) => (
        <ElectricSpark
          key={s.id}
          spark={s}
          isHovered={isHovered}
          color={color}
          expandedBoost={expandedBoost}
        />
      ))}
    </div>
  );
}
