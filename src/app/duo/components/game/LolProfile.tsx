"use client";

import { Crown, MapPin, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LolStats } from "../../types/duo";

const LOL_ROLES = ["Top", "Jungle", "Mid", "ADC", "Support"] as const;

const RANK_COLORS: Record<string, string> = {
  Iron: "text-gray-400",
  Bronze: "text-amber-700",
  Silver: "text-gray-300",
  Gold: "text-yellow-400",
  Platinum: "text-teal-400",
  Emerald: "text-emerald-400",
  Diamond: "text-blue-400",
  Master: "text-purple-500",
  Grandmaster: "text-red-500",
  Challenger: "text-yellow-300",
};

interface LolProfileProps {
  stats: LolStats;
  mainRole: string;
  secondaryRole: string;
  onMainRoleChange: (role: string) => void;
  onSecondaryRoleChange: (role: string) => void;
}

export function LolProfile({
  stats,
  mainRole,
  secondaryRole,
  onMainRoleChange,
  onSecondaryRoleChange,
}: LolProfileProps) {
  const tier = stats.rank?.split(" ")[0] ?? "";
  const rankColor = RANK_COLORS[tier] ?? "text-muted-foreground";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm backdrop-blur-sm sm:p-7">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-glow-primary ring-2 ring-primary/20">
            {stats.icon ? (
              <img src={stats.icon} alt="" className="h-full w-full object-cover" />
            ) : (
              stats.username?.[0]?.toUpperCase() ?? "?"
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-card-foreground sm:text-xl">
              {stats.username}
              <span className="ml-1 text-sm font-semibold text-primary">#{stats.tag}</span>
            </p>
            <p className="text-sm text-muted-foreground">Nível {stats.level}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/30 px-4 py-3 sm:flex-col sm:items-end sm:py-3">
          <div className="flex items-center gap-2">
            <Crown className={`h-5 w-5 shrink-0 ${rankColor}`} />
            <span className={`font-semibold ${rankColor}`}>{stats.rank}</span>
          </div>
          <Badge variant="outline" className="border-primary/25 bg-primary/5 text-xs font-semibold text-primary">
            {stats.league_points} LP
          </Badge>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-border/40 bg-gradient-to-b from-emerald-500/10 to-transparent px-2 py-3 text-center">
          <p className="text-lg font-bold text-neon-green sm:text-xl">{stats.wins}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
            Vitórias
          </p>
        </div>
        <div className="rounded-xl border border-border/40 bg-gradient-to-b from-destructive/10 to-transparent px-2 py-3 text-center">
          <p className="text-lg font-bold text-destructive sm:text-xl">{stats.losses}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
            Derrotas
          </p>
        </div>
        <div className="rounded-xl border border-border/40 bg-gradient-to-b from-primary/15 to-transparent px-2 py-3 text-center">
          <p className="text-lg font-bold text-primary sm:text-xl">{stats.winrate}%</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
            Winrate
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">Suas lanes</h3>
            <p className="text-xs text-muted-foreground">Como você aparece para outros jogadores</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Lane principal</label>
            <Select value={mainRole} onValueChange={onMainRoleChange}>
              <SelectTrigger className="h-11 rounded-xl border-border/80 bg-input/45 transition-colors hover:border-primary/30 focus:border-primary">
                <SelectValue placeholder="Lane" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {LOL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Lane secundária</label>
            <Select value={secondaryRole} onValueChange={onSecondaryRoleChange}>
              <SelectTrigger className="h-11 rounded-xl border-border/80 bg-input/45 transition-colors hover:border-primary/30 focus:border-primary">
                <SelectValue placeholder="Lane" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {LOL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-border/40 pt-5">
        <Zap className="h-4 w-4 text-neon-green" />
        <span className="text-sm text-muted-foreground">Online agora</span>
      </div>
    </div>
  );
}
