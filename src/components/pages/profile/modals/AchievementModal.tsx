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
  progression?: { current: number; next: number; path: number[] };
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
  const isLegendaryOrCelestial =
    achievement.rarity === "legendary" || achievement.rarity === "celestial";

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
            style={{ padding: showAnimatedBorder ? "1.5px" : "1px" }}
          >
            {showAnimatedBorder ? (
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
                  duration: config.borderRotationSpeed * 0.6,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: config.staticBorderColor }}
              />
            )}

            <div
              className="relative overflow-hidden"
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      % dos jogadores
                    </span>
                    <span className="font-medium">
                      {achievement.percentage}%
                    </span>
                  </div>

                  {achievement.progression ? (
                    <div className="pt-2 border-t border-border">
                      <div className="text-sm font-medium mb-2">
                        Caminho da Conquista
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {achievement.progression.path.map((p: number) => (
                          <Badge
                            key={p}
                            variant="outline"
                            className={
                              p <= achievement.progression!.current
                                ? "text-white border-0"
                                : "border-border"
                            }
                            style={
                              p <= achievement.progression!.current
                                ? { background: config.badgeGradient }
                                : undefined
                            }
                          >
                            {p}h
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Próxima: {achievement.progression.next}h
                      </div>
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
