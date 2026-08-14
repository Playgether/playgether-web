"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  rarityConfig,
  type RarityLevel,
} from "@/components/pages/profile/rarityConfig";
import { RarityAchievementChrome } from "@/components/pages/profile/ConquistText";
import { AchievementHoverPreviewCard } from "@/components/pages/profile/AchievementHoverPreviewCard";
import type { HighlightedAchievementPublic } from "@/types/highlightedAchievements";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { useCanHover } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const RARITY_SET = new Set<string>(Object.keys(rarityConfig));

const PREVIEW_CONTENT_CLASS =
  "z-[500] max-w-xs border-0 bg-transparent p-0 shadow-none overflow-visible text-left";

/**
 * Estágios de truncamento do título (mais longo → mais curto).
 * `0` = só ícone.
 */
const TITLE_STAGES = [18, 14, 10, 7, 5, 0] as const;

function BadgesRow({
  list,
  compact,
  iconOnly,
  titleMaxChars,
  overflow,
}: {
  list: HighlightedAchievementPublic[];
  compact: boolean;
  iconOnly: boolean;
  titleMaxChars: number;
  overflow: number;
}) {
  return (
    <>
      {list.map((a) => (
        <AchievementHighlightChip
          key={a.id}
          achievement={a}
          compact={compact || iconOnly}
          iconOnly={iconOnly}
          titleMaxChars={titleMaxChars}
        />
      ))}
      {overflow > 0 ? (
        <span
          className="shrink-0 rounded-full bg-muted/80 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground"
          title={`${overflow} conquista${overflow === 1 ? "" : "s"} a mais`}
        >
          +{overflow}
        </span>
      ) : null}
    </>
  );
}

function normalizeRarity(r: string): RarityLevel {
  return (RARITY_SET.has(r) ? r : "common") as RarityLevel;
}

function AchievementPreview({
  achievement: a,
  rarity,
}: {
  achievement: HighlightedAchievementPublic;
  rarity: RarityLevel;
}) {
  return (
    <AchievementHoverPreviewCard
      title={a.title}
      description={a.description}
      rarity={rarity}
      icon={a.icon}
      iconImageUrl={a.icon_image_url}
      game={a.game}
      date={a.date}
      percentage={a.percentage}
    />
  );
}

function AchievementChipBody({
  achievement: a,
  rarity,
  cfg,
  compact,
  iconOnly = false,
  titleMaxChars = 18,
  isHovered,
  isExpanded,
  className,
}: {
  achievement: HighlightedAchievementPublic;
  rarity: RarityLevel;
  cfg: (typeof rarityConfig)[RarityLevel];
  compact: boolean;
  iconOnly?: boolean;
  titleMaxChars?: number;
  isHovered: boolean;
  isExpanded: boolean;
  className?: string;
}) {
  const reducedMotion = useReducedMotion() ?? false;

  const iconNode = a.icon_image_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={a.icon_image_url}
      alt=""
      className={cn(
        "shrink-0 object-contain",
        iconOnly ? "h-3.5 w-3.5" : compact ? "h-3 w-3" : "h-3.5 w-3.5",
      )}
    />
  ) : (
    <span
      className={cn(
        "leading-none shrink-0",
        iconOnly ? "text-xs" : compact ? "text-[10px]" : "text-[11px]",
      )}
      aria-hidden
    >
      {a.icon || "🏆"}
    </span>
  );

  if (iconOnly) {
    return (
      <motion.span
        className={cn("inline-flex shrink-0", className)}
        animate={
          !reducedMotion &&
          (isHovered || isExpanded) &&
          cfg.hoverScale > 1 &&
          !cfg.rotatingBorder
            ? { scale: Math.min(cfg.hoverScale, 1.06) }
            : { scale: 1 }
        }
        transition={{ duration: 0.2 }}
      >
        <RarityAchievementChrome
          rarity={rarity}
          isHovered={isHovered}
          isExpanded={isExpanded}
          reducedMotion={reducedMotion}
          staticBorder={false}
          variant="chip"
          contentClassName="relative z-10 flex h-6 w-6 items-center justify-center rounded-full p-0"
        >
          <span className={cn("flex items-center justify-center", cfg.textColor)}>
            {iconNode}
          </span>
        </RarityAchievementChrome>
      </motion.span>
    );
  }

  const titleShort =
    a.title.length > titleMaxChars
      ? `${a.title.slice(0, Math.max(1, titleMaxChars - 1))}…`
      : a.title;

  return (
    <motion.span
      className={cn("inline-flex min-w-0 max-w-full shrink-0", className)}
      animate={
        !reducedMotion &&
        (isHovered || isExpanded) &&
        cfg.hoverScale > 1 &&
        !cfg.rotatingBorder
          ? { scale: Math.min(cfg.hoverScale, 1.04) }
          : { scale: 1 }
      }
      transition={{ duration: 0.2 }}
    >
      <RarityAchievementChrome
        rarity={rarity}
        isHovered={isHovered}
        isExpanded={isExpanded}
        reducedMotion={reducedMotion}
        staticBorder={false}
        variant="chip"
        className="min-w-0 max-w-full"
        contentClassName={cn(
          "relative z-10 flex min-w-0 max-w-full items-center gap-1 rounded-[calc(var(--radius)-2px)] subpixel-antialiased",
          compact ? "px-1 py-0.5" : "px-1.5 py-[3px]",
        )}
      >
        <span className={cn("flex shrink-0 items-center", cfg.textColor)}>
          {iconNode}
        </span>
        <span
          className={cn(
            "flex min-w-0 items-center gap-0.5 font-semibold leading-tight",
            compact ? "text-[9px] sm:text-[10px]" : "text-[10px]",
          )}
        >
          <span className="shrink-0 tabular-nums text-zinc-300 [transform:translateZ(0)]">
            {a.game_short}
          </span>
          <span className="shrink-0 text-zinc-400">·</span>
          <span className="min-w-0 whitespace-nowrap font-medium text-white [transform:translateZ(0)]">
            {titleShort}
          </span>
        </span>
      </RarityAchievementChrome>
    </motion.span>
  );
}

function AchievementHighlightChipTouch({
  achievement: a,
  className,
  compact = false,
  iconOnly = false,
  titleMaxChars = 18,
}: {
  achievement: HighlightedAchievementPublic;
  className?: string;
  compact?: boolean;
  iconOnly?: boolean;
  titleMaxChars?: number;
}) {
  const rarity = normalizeRarity(String(a.rarity));
  const cfg = rarityConfig[rarity];
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <button
          type="button"
          className={cn(
            "relative z-20 inline-flex min-w-0 max-w-full shrink-0 touch-manipulation border-0 bg-transparent p-0 text-left",
            className,
          )}
          aria-expanded={open}
          aria-label={`Ver conquista: ${a.title}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
        >
          <AchievementChipBody
            achievement={a}
            rarity={rarity}
            cfg={cfg}
            compact={compact}
            iconOnly={iconOnly}
            titleMaxChars={titleMaxChars}
            isHovered={open}
            isExpanded={open}
          />
        </button>
      </PopoverAnchor>
      <PopoverContent
        side="top"
        align="start"
        className={PREVIEW_CONTENT_CLASS}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <AchievementPreview achievement={a} rarity={rarity} />
      </PopoverContent>
    </Popover>
  );
}

function AchievementHighlightChipHover({
  achievement: a,
  className,
  compact = false,
  iconOnly = false,
  titleMaxChars = 18,
}: {
  achievement: HighlightedAchievementPublic;
  className?: string;
  compact?: boolean;
  iconOnly?: boolean;
  titleMaxChars?: number;
}) {
  const rarity = normalizeRarity(String(a.rarity));
  const cfg = rarityConfig[rarity];
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open} onOpenChange={setOpen} delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative z-20 inline-flex min-w-0 max-w-full shrink-0 cursor-help border-0 bg-transparent p-0 text-left",
            className,
          )}
          aria-label={`Conquista: ${a.title}`}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <AchievementChipBody
            achievement={a}
            rarity={rarity}
            cfg={cfg}
            compact={compact}
            iconOnly={iconOnly}
            titleMaxChars={titleMaxChars}
            isHovered={open}
            isExpanded={false}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className={PREVIEW_CONTENT_CLASS}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <AchievementPreview achievement={a} rarity={rarity} />
      </TooltipContent>
    </Tooltip>
  );
}

function AchievementHighlightChip({
  achievement,
  className,
  compact = false,
  iconOnly = false,
  titleMaxChars = 18,
}: {
  achievement: HighlightedAchievementPublic;
  className?: string;
  compact?: boolean;
  iconOnly?: boolean;
  titleMaxChars?: number;
}) {
  const canHover = useCanHover();

  if (canHover) {
    return (
      <AchievementHighlightChipHover
        achievement={achievement}
        className={className}
        compact={compact}
        iconOnly={iconOnly}
        titleMaxChars={titleMaxChars}
      />
    );
  }

  return (
    <AchievementHighlightChipTouch
      achievement={achievement}
      className={className}
      compact={compact}
      iconOnly={iconOnly}
      titleMaxChars={titleMaxChars}
    />
  );
}

export function HighlightedAchievementBadges({
  achievements,
  className,
  max = 3,
  compact = false,
  iconOnly,
  adaptive = true,
}: {
  achievements?: HighlightedAchievementPublic[] | null;
  className?: string;
  max?: number;
  compact?: boolean;
  iconOnly?: boolean;
  adaptive?: boolean;
}) {
  const all = achievements ?? [];
  const list = all.slice(0, max);
  const overflow = all.length - list.length;
  const listKey = list.map((a) => a.id).join(",");
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [titleMaxChars, setTitleMaxChars] = useState<number>(TITLE_STAGES[0]);

  const forcedIconOnly = iconOnly === true;
  const resolvedIconOnly =
    forcedIconOnly || (adaptive && titleMaxChars === 0);
  const resolvedCompact = compact || resolvedIconOnly;
  const resolvedTitleMax =
    titleMaxChars > 0 ? titleMaxChars : TITLE_STAGES[0];

  useLayoutEffect(() => {
    if (!adaptive || iconOnly != null || list.length === 0) {
      setTitleMaxChars(iconOnly ? 0 : TITLE_STAGES[0]);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const updateLayout = () => {
      // Usa a largura do pai para evitar feedback loop
      // (container encolhe quando cai em ícone → sempre escolhe ícone).
      const parent = container.parentElement;
      const available = Math.max(
        container.clientWidth,
        parent?.clientWidth ?? 0,
      );
      if (available <= 0) return;

      // Folga para borda/glow dos chips — sem isso o estágio “cabe” na
      // medição mas a row com overflow corta o último/meio badge.
      const fitBudget = Math.max(0, available - 8);

      let chosen: number = 0;
      for (let i = 0; i < TITLE_STAGES.length; i++) {
        const stage = TITLE_STAGES[i];
        const el = measureRefs.current[i];
        if (!el) continue;
        if (el.scrollWidth <= fitBudget) {
          chosen = stage;
          break;
        }
      }
      setTitleMaxChars((prev) => (prev === chosen ? prev : chosen));
    };

    updateLayout();

    const observer = new ResizeObserver(updateLayout);
    observer.observe(container);
    if (container.parentElement) observer.observe(container.parentElement);
    return () => observer.disconnect();
  }, [adaptive, iconOnly, listKey, max, compact]);

  if (list.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        ref={containerRef}
        className={cn("relative z-20 min-w-0 max-w-full", className)}
        aria-label="Conquistas em destaque"
      >
        {/* Clip evita scroll horizontal pelo w-max das medições */}
        {adaptive && iconOnly == null ? (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            {TITLE_STAGES.map((stage, idx) => (
              <div
                key={stage}
                ref={(el) => {
                  measureRefs.current[idx] = el;
                }}
                className="absolute left-0 top-0 flex w-max flex-nowrap gap-1 opacity-0"
              >
                <BadgesRow
                  list={list}
                  compact={compact}
                  iconOnly={stage === 0}
                  titleMaxChars={stage === 0 ? TITLE_STAGES[0] : stage}
                  overflow={overflow}
                />
              </div>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            "flex w-full max-w-full items-center py-0.5",
            resolvedIconOnly
              ? "flex-nowrap gap-0.5 overflow-x-auto scrollbar-none"
              : "flex-wrap gap-1 overflow-visible",
          )}
        >
          <BadgesRow
            list={list}
            compact={resolvedCompact}
            iconOnly={resolvedIconOnly}
            titleMaxChars={resolvedTitleMax}
            overflow={overflow}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
