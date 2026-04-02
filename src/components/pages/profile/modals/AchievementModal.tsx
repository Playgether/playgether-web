"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { AchievementElectricOverlay } from "../AchievementElectricOverlay";
import { rarityConfig } from "../rarityConfig";
import type { RarityLevel } from "../rarityConfig";

export type AchievementType = {
  id: number;
  title: string;
  description: string;
  rarity: RarityLevel;
  icon: string;
  game: string;
  date: string;
  percentage: number;
  /** Marco desta linha na escada (ex. 2500); limita o “Caminho” neste modal. */
  checkpointValue?: number | null;
  progression?: {
    current: number;
    next: number | null;
    path: number[];
    unit?: string;
  };
  recentlyUnlocked?: boolean;
};

export function AchievementModal({
  isOpen,
  onClose,
  achievement,
}: {
  isOpen: boolean;
  onClose: () => void;
  achievement: AchievementType | null;
}) {
  if (!achievement) return null;

  const config = rarityConfig[achievement.rarity] ?? rarityConfig.common;
  const showAnimatedBorder = config.hasAnimatedBorder;
  const borderRotates = config.rotatingBorder;
  const hasElectric = config.hasElectricEffect;
  const isLegendaryOrCelestial =
    achievement.rarity === "legendary" || achievement.rarity === "celestial";

  const prog = achievement.progression;
  const statProgress = prog?.current ?? 0;
  const tierCap =
    achievement.checkpointValue != null &&
    typeof achievement.checkpointValue === "number"
      ? achievement.checkpointValue
      : null;
  /** Progresso exibido neste modal: não ultrapassa o marco desta conquista. */
  const displayCurrent =
    tierCap !== null ? Math.min(statProgress, tierCap) : statProgress;
  const globalNext =
    prog?.next != null && typeof prog.next === "number" ? prog.next : null;
  /** Próximo marco na escada a partir do nível desta conquista (ex. na de 2500 → 5000). */
  const nextForView =
    tierCap !== null && prog?.path?.length
      ? (() => {
          const ahead = prog.path.filter((p) => p > tierCap);
          return ahead.length ? Math.min(...ahead) : null;
        })()
      : globalNext;
  const hasNextCheckpoint = nextForView != null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 border-0 bg-transparent shadow-none overflow-visible [&>button]:hidden">
        <motion.div
          className="rounded-xl overflow-visible"
          animate={{ boxShadow: config.glowExpanded }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ willChange: "box-shadow" }}
        >
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              padding: showAnimatedBorder ? "1.5px" : "1px",
              isolation: "isolate",
              clipPath: "inset(0 round var(--radius))",
              WebkitClipPath: "inset(0 round var(--radius))",
              transform: "translateZ(0)",
            }}
          >
            {showAnimatedBorder && borderRotates ? (
              <div
                className="absolute inset-0 rounded-xl pointer-events-none z-0"
                style={{ background: config.staticBorderColor }}
                aria-hidden
              />
            ) : null}
            {showAnimatedBorder ? (
              borderRotates ? (
                <motion.div
                  className="absolute pointer-events-none z-[1]"
                  style={{
                    inset: "-200%",
                    width: "500%",
                    height: "500%",
                    background: config.borderGradient,
                    willChange: "transform",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: Math.max(config.borderRotationSpeed * 0.6, 0.35),
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ) : (
                <div
                  className="absolute pointer-events-none z-[1]"
                  style={{
                    inset: "-200%",
                    width: "500%",
                    height: "500%",
                    background: config.borderGradient,
                  }}
                />
              )
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: config.staticBorderColor }}
              />
            )}

            <div
              className="relative z-[2] overflow-hidden"
              style={{
                background: config.cardBg,
                borderRadius: "calc(var(--radius) - 1.5px)",
              }}
            >
              {isLegendaryOrCelestial && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.18 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    background:
                      achievement.rarity === "celestial"
                        ? "radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.5) 0%, rgba(59,130,246,0.3) 50%, transparent 80%)"
                        : "radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.4) 0%, transparent 70%)",
                  }}
                />
              )}

              {hasElectric ? (
                <AchievementElectricOverlay
                  rarity={achievement.rarity}
                  isHovered
                  isExpanded
                  clipClassName="rounded-[calc(var(--radius)-1.5px)]"
                />
              ) : null}

              <div className="relative z-10 p-6 pt-12">
                <DialogClose
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-50 p-1"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </DialogClose>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span>{achievement.icon}</span>
                    {achievement.title}
                  </DialogTitle>
                  <DialogDescription>
                    {achievement.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Raridade</span>
                    <Badge
                      variant="outline"
                      className="text-white border-0 text-xs"
                      style={{ background: config.badgeGradient }}
                    >
                      {config.icon} {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Jogo</span>
                    <span className="font-medium">{achievement.game}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Conquistado em
                    </span>
                    <span className="font-medium">{achievement.date}</span>
                  </div>
                  {/* Taxa global (%): oculto no lançamento — poucos usuários distorce o número.
                      O backend pode continuar enviando `percentage`; reative quando houver base estável. */}
                  {/* <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      % dos jogadores
                    </span>
                    <span className="font-medium">
                      {achievement.percentage}%
                    </span>
                  </div> */}

                  {achievement.progression ? (
                    <div className="pt-2 border-t border-border">
                      <div className="text-sm font-medium mb-2">
                        Caminho da Conquista
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {achievement.progression.path.map((p: number) => {
                          const u = achievement.progression?.unit === "h" ? "h" : "";
                          const unlocked = p <= displayCurrent;
                          return (
                            <Badge
                              key={p}
                              variant="outline"
                              className={
                                unlocked
                                  ? "text-white border-0"
                                  : "border-border text-muted-foreground bg-muted/30"
                              }
                              style={
                                unlocked
                                  ? { background: config.badgeGradient }
                                  : undefined
                              }
                            >
                              {u ? `${p}${u}` : p}
                            </Badge>
                          );
                        })}
                      </div>
                      {hasNextCheckpoint ? (
                        <div className="text-sm text-muted-foreground mt-2">
                          Próxima:{" "}
                          {achievement.progression!.unit === "h"
                            ? `${nextForView}h`
                            : nextForView}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
