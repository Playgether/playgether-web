"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { type RarityLevel, type RarityConfig, rarityConfig } from "./rarityConfig";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConquistTextProps {
  text: string;
  title: string;
  Icon?: React.ReactNode;
  date: string;
  rarity?: RarityLevel;
  recentlyUnlocked?: boolean;
  /** Quando definido, o clique no card chama esta função em vez de expandir/recolher */
  onCardClick?: () => void;
}

interface ParticleData {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

interface SparkData {
  id: number;
  x: number;
  y: number;
  rotation: number;
  duration: number;
  delay: number;
  repeatDelay: number;
}

interface StarData {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  twinkleDuration: number;
}

// ─── Particle System ──────────────────────────────────────────────────────────

const FloatingParticle = ({
  particle,
  isHovered,
  isExpanded,
  isFireMode,
}: {
  particle: ParticleData;
  isHovered: boolean;
  isExpanded: boolean;
  isFireMode: boolean;
}) => {
  const intensity = isExpanded ? 1.4 : isHovered ? 1.15 : 1;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${particle.x}%`,
        top: isFireMode ? "auto" : `${particle.y}%`,
        bottom: isFireMode ? `${Math.random() * 20}%` : "auto",
        width: particle.size,
        height: isFireMode ? particle.size * 2.5 : particle.size,
        background: particle.color,
        filter: `blur(${particle.size * 0.6}px)`,
        willChange: "transform, opacity",
      }}
      animate={{
        y: isFireMode
          ? [0, -(60 + 30 * intensity), -(100 + 50 * intensity)]
          : [0, -(18 + 10 * intensity), 0],
        x: isFireMode
          ? [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 20]
          : [0, (Math.random() - 0.5) * 8, 0],
        opacity: isFireMode
          ? [0.8 * intensity, 0.5 * intensity, 0]
          : [0, 0.7 * intensity, 0],
        scale: isFireMode
          ? [1, 0.7, 0.2]
          : [0.5, 1 * intensity, 0.5],
      }}
      transition={{
        duration: particle.duration * (isExpanded ? 0.8 : 1),
        delay: particle.delay,
        repeat: Infinity,
        ease: isFireMode ? "easeOut" : "easeInOut",
      }}
    />
  );
};

const ParticleSystem = ({
  particles,
  isHovered,
  isExpanded,
  isFireMode,
}: {
  particles: ParticleData[];
  isHovered: boolean;
  isExpanded: boolean;
  isFireMode: boolean;
}) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[calc(var(--radius)-1px)]">
    {particles.map((p) => (
      <FloatingParticle
        key={p.id}
        particle={p}
        isHovered={isHovered}
        isExpanded={isExpanded}
        isFireMode={isFireMode}
      />
    ))}
  </div>
);

// ─── Electric Effect ──────────────────────────────────────────────────────────

const ElectricSpark = ({
  spark,
  isHovered,
  color,
}: {
  spark: SparkData;
  isHovered: boolean;
  color: string;
}) => (
  <motion.div
    className="absolute pointer-events-none"
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
      opacity: [0, 1, 0.6, 0],
      scaleX: [0, 1, 0.8, 0],
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

const ElectricEffect = ({
  sparks,
  isHovered,
  config,
}: {
  sparks: SparkData[];
  isHovered: boolean;
  config: RarityConfig;
}) => {
  const color =
    config.label === "Lendário"
      ? "rgba(251,191,36,0.9)"
      : "rgba(196,181,253,0.9)";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[calc(var(--radius)-1px)]">
      {sparks.map((s) => (
        <ElectricSpark
          key={s.id}
          spark={s}
          isHovered={isHovered}
          color={color}
        />
      ))}
    </div>
  );
};

// ─── Cosmic Effect ────────────────────────────────────────────────────────────

const CosmicStar = ({
  star,
  isHovered,
  isExpanded,
}: {
  star: StarData;
  isHovered: boolean;
  isExpanded: boolean;
}) => {
  const intensity = isExpanded ? 1.5 : isHovered ? 1.2 : 1;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: star.size,
        height: star.size,
        background: star.color,
        filter: `blur(${star.size * 0.2}px)`,
        willChange: "opacity, transform",
      }}
      animate={{
        opacity: [0, intensity, 0.4 * intensity, intensity, 0],
        scale: [0, 1.5, 0.8, 1.5, 0],
      }}
      transition={{
        duration: star.twinkleDuration,
        delay: star.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

const CosmicEffect = ({
  stars,
  isHovered,
  isExpanded,
}: {
  stars: StarData[];
  isHovered: boolean;
  isExpanded: boolean;
}) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[calc(var(--radius)-1px)]">
    {stars.map((s) => (
      <CosmicStar
        key={s.id}
        star={s}
        isHovered={isHovered}
        isExpanded={isExpanded}
      />
    ))}
  </div>
);

// ─── Animated Border ──────────────────────────────────────────────────────────

const AnimatedBorder = ({
  config,
  isHovered,
  isExpanded,
}: {
  config: RarityConfig;
  isHovered: boolean;
  isExpanded: boolean;
}) => {
  const speed = isExpanded
    ? config.borderRotationSpeed * 0.6
    : isHovered
    ? config.borderRotationSpeed * 0.75
    : config.borderRotationSpeed;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        inset: "-200%",
        width: "500%",
        height: "500%",
        background: config.borderGradient,
        willChange: "transform",
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

// ─── Rarity Badge ─────────────────────────────────────────────────────────────

const RarityBadge = ({
  config,
  rarity,
  isHovered,
  reducedMotion,
}: {
  config: RarityConfig;
  rarity: RarityLevel;
  isHovered: boolean;
  reducedMotion: boolean;
}) => {
  const isAnimated =
    !reducedMotion && config.animationIntensity !== "none";

  return (
    <motion.div
      className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full text-white select-none"
      style={{ background: config.badgeGradient }}
      animate={
        isAnimated && rarity !== "common" && rarity !== "medium"
          ? {
              boxShadow: isHovered
                ? `0 0 10px ${config.staticBorderColor}, 0 0 4px ${config.staticBorderColor}`
                : `0 0 4px ${config.staticBorderColor}`,
            }
          : {}
      }
      transition={{ duration: 0.3 }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </motion.div>
  );
};

// ─── Recently Unlocked Overlay ────────────────────────────────────────────────

const RecentlyUnlockedOverlay = () => (
  <motion.div
    className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-20 flex items-center justify-center"
    initial={{ opacity: 1 }}
    animate={{ opacity: 0 }}
    transition={{ delay: 2.2, duration: 0.8 }}
  >
    <div className="absolute inset-0 bg-white/5" />
    <motion.div
      className="relative flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
      initial={{ scale: 0, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 1.2, opacity: 0 }}
      transition={{ duration: 0.35, ease: "backOut" }}
    >
      ✨ Recém Desbloqueada!
    </motion.div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const cardVariants: Variants = {
  collapsed: { opacity: 1 },
  expanded: { opacity: 1 },
};

const descriptionVariants: Variants = {
  collapsed: { opacity: 0, height: 0, marginTop: 0 },
  expanded: { opacity: 1, height: "auto", marginTop: 8 },
};

export const ConquistText = ({
  text,
  title,
  Icon,
  date,
  rarity = "common",
  recentlyUnlocked = false,
  onCardClick,
}: ConquistTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showUnlocked, setShowUnlocked] = useState(recentlyUnlocked);
  const reducedMotion = useReducedMotion() ?? false;

  const config = rarityConfig[rarity];
  const isAnimated = !reducedMotion && config.animationIntensity !== "none";

  useEffect(() => {
    if (!recentlyUnlocked) return;
    const t = setTimeout(() => setShowUnlocked(false), 3200);
    return () => clearTimeout(t);
  }, [recentlyUnlocked]);

  // Stable particle data
  const particles = useMemo<ParticleData[]>(
    () =>
      Array.from({ length: config.particleCount }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        y: 5 + Math.random() * 90,
        size: 2 + Math.random() * 4,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 3,
        color:
          config.particleColors[i % config.particleColors.length] ??
          "rgba(255,255,255,0.5)",
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rarity]
  );

  // Stable electric spark data
  const sparks = useMemo<SparkData[]>(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: Math.random() * 90,
        y: Math.random() * 90,
        rotation: Math.random() * 360,
        duration: 0.2 + Math.random() * 0.2,
        delay: Math.random() * 2,
        repeatDelay: 1 + Math.random() * 2.5,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rarity]
  );

  // Stable cosmic star data
  const stars = useMemo<StarData[]>(
    () =>
      Array.from({ length: config.particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 3,
        duration: 0,
        delay: Math.random() * 4,
        color:
          config.particleColors[i % config.particleColors.length] ??
          "rgba(255,255,255,0.8)",
        twinkleDuration: 1.5 + Math.random() * 3,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rarity]
  );

  // Glow shadow derived from state
  const glowShadow = useMemo(() => {
    if (!isAnimated) return config.glowBase;
    if (isExpanded) return config.glowExpanded;
    if (isHovered) return config.glowHover;
    return config.glowBase;
  }, [isAnimated, isExpanded, isHovered, config]);

  const handleClick = useCallback(() => {
    if (onCardClick) {
      onCardClick();
    } else {
      setIsExpanded((v) => !v);
    }
  }, [onCardClick]);

  const isCommon = rarity === "common";
  const showBorder = config.hasAnimatedBorder && isAnimated;

  return (
    <motion.div
      layout
      variants={cardVariants}
      className="relative w-full cursor-pointer"
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={
        !reducedMotion && config.hoverScale > 1
          ? { scale: config.hoverScale }
          : {}
      }
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ willChange: "transform" }}
    >
      {/* ── Outer glow wrapper ────────────────────────────────────────────── */}
      <motion.div
        className="rounded-xl"
        animate={{ boxShadow: glowShadow }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ willChange: "box-shadow" }}
      >
        {/* ── Border container (clips the rotating gradient) ─────────────── */}
        <div
          className="relative rounded-xl overflow-hidden"
          style={{ padding: showBorder ? "1.5px" : "1px" }}
        >
          {/* Border layer */}
          {showBorder ? (
            <AnimatedBorder
              config={config}
              isHovered={isHovered}
              isExpanded={isExpanded}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: config.staticBorderColor }}
            />
          )}

          {/* ── Inner card ─────────────────────────────────────────────────── */}
          <div
            className="relative rounded-[calc(var(--radius)-1.5px)] overflow-hidden"
            style={{ background: config.cardBg }}
          >
            {/* Background glow overlay (for extreme rarities) */}
            {isAnimated &&
              (rarity === "legendary" || rarity === "celestial") && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    opacity: isExpanded ? 0.18 : isHovered ? 0.12 : 0.07,
                  }}
                  style={{
                    background:
                      rarity === "celestial"
                        ? "radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.5) 0%, rgba(59,130,246,0.3) 50%, transparent 80%)"
                        : "radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.4) 0%, transparent 70%)",
                  }}
                  transition={{ duration: 0.5 }}
                />
              )}

            {/* Particle system */}
            {isAnimated && config.hasParticles && !config.hasCosmicEffect && (
              <ParticleSystem
                particles={particles}
                isHovered={isHovered}
                isExpanded={isExpanded}
                isFireMode={config.hasFireEffect}
              />
            )}

            {/* Cosmic star system */}
            {isAnimated && config.hasCosmicEffect && (
              <CosmicEffect
                stars={stars}
                isHovered={isHovered}
                isExpanded={isExpanded}
              />
            )}

            {/* Electric effect */}
            {isAnimated && config.hasElectricEffect && (
              <ElectricEffect
                sparks={sparks}
                isHovered={isHovered}
                config={config}
              />
            )}

            {/* Recently unlocked overlay */}
            <AnimatePresence>
              {showUnlocked && <RecentlyUnlockedOverlay key="unlocked" />}
            </AnimatePresence>

            {/* ── Content ──────────────────────────────────────────────────── */}
            <div className="relative z-10 p-4">
              <div className="flex items-start gap-4">
                {/* Icon box */}
                <motion.div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                  animate={
                    isAnimated && !isCommon
                      ? {
                          boxShadow: isHovered
                            ? `0 0 16px ${config.staticBorderColor}, inset 0 0 8px ${config.staticBorderColor}33`
                            : `0 0 6px ${config.staticBorderColor}99`,
                        }
                      : {}
                  }
                  style={{
                    background: isCommon
                      ? "rgba(39,39,42,0.6)"
                      : `${config.staticBorderColor}22`,
                    border: `1px solid ${config.staticBorderColor}66`,
                    willChange: "box-shadow",
                  }}
                  transition={{ duration: 0.35 }}
                >
                  {/* Icon inner glow for epic+ */}
                  {isAnimated &&
                    (rarity === "legendary" ||
                      rarity === "celestial" ||
                      rarity === "mythic" ||
                      rarity === "epic") && (
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          opacity: [0.15, 0.35, 0.15],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          background: `radial-gradient(circle, ${config.staticBorderColor}55, transparent 70%)`,
                        }}
                      />
                    )}

                  <div
                    className={`scale-75 relative z-10 ${config.textColor}`}
                  >
                    {Icon ?? <span className="text-xl">🏆</span>}
                  </div>
                </motion.div>

                {/* Text content */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h4 className={`font-semibold ${config.textColor} leading-snug`}>
                      {title}
                    </h4>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded border border-border/40 bg-black/20 whitespace-nowrap flex-shrink-0">
                      {date}
                    </span>
                  </div>

                  {/* Rarity badge */}
                  <div className="flex items-center gap-2">
                    <RarityBadge
                      config={config}
                      rarity={rarity}
                      isHovered={isHovered}
                      reducedMotion={reducedMotion}
                    />

                    {/* Collapsed description preview */}
                    {!isExpanded && (
                      <p className="text-xs text-muted-foreground truncate flex-1">
                        {text}
                      </p>
                    )}

                    {/* Chevron */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex-shrink-0 ml-auto"
                    >
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </motion.div>
                  </div>

                  {/* Expanded description */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        key="description"
                        variants={descriptionVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {text}
                        </p>

                        {/* Expanded halo accent for high+ rarities */}
                        {isAnimated &&
                          (rarity === "epic" ||
                            rarity === "mythic" ||
                            rarity === "legendary" ||
                            rarity === "celestial") && (
                            <motion.div
                              className="mt-3 h-px w-full"
                              style={{
                                background: `linear-gradient(90deg, transparent, ${config.staticBorderColor}, transparent)`,
                              }}
                              initial={{ scaleX: 0, opacity: 0 }}
                              animate={{ scaleX: 1, opacity: 0.7 }}
                              exit={{ scaleX: 0, opacity: 0 }}
                              transition={{ duration: 0.4 }}
                            />
                          )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
