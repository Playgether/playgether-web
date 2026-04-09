"use client";

import { Crown, Zap } from "lucide-react";
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
    <div className="card-glass rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-glow-primary">
          {stats.icon ? (
            <img src={stats.icon} alt="icon" className="w-full h-full rounded-full object-cover" />
          ) : (
            stats.username?.[0]?.toUpperCase() ?? "?"
          )}
        </div>
        <div>
          <p className="text-xl font-bold text-card-foreground">
            {stats.username}
            <span className="text-primary text-sm font-medium ml-1">#{stats.tag}</span>
          </p>
          <p className="text-muted-foreground text-sm">Nível {stats.level}</p>
        </div>
      </div>

      {/* Rank + LP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Crown className={`w-5 h-5 ${rankColor}`} />
          <span className={`font-semibold ${rankColor}`}>{stats.rank}</span>
        </div>
        <Badge variant="outline" className="text-xs border-border/50">
          {stats.league_points} LP
        </Badge>
      </div>

      {/* W/L/WR */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-muted/20 rounded-lg p-2">
          <p className="text-neon-green font-bold text-lg">{stats.wins}</p>
          <p className="text-muted-foreground text-xs">Vitórias</p>
        </div>
        <div className="bg-muted/20 rounded-lg p-2">
          <p className="text-destructive font-bold text-lg">{stats.losses}</p>
          <p className="text-muted-foreground text-xs">Derrotas</p>
        </div>
        <div className="bg-muted/20 rounded-lg p-2">
          <p className="text-primary font-bold text-lg">{stats.winrate}%</p>
          <p className="text-muted-foreground text-xs">Winrate</p>
        </div>
      </div>

      {/* Editable roles */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Lane Principal</label>
          <Select value={mainRole} onValueChange={onMainRoleChange}>
            <SelectTrigger className="bg-input/50 border-border focus:border-primary transition-colors h-9">
              <SelectValue placeholder="Lane" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {LOL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Lane Secundária</label>
          <Select value={secondaryRole} onValueChange={onSecondaryRoleChange}>
            <SelectTrigger className="bg-input/50 border-border focus:border-primary transition-colors h-9">
              <SelectValue placeholder="Lane" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {LOL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Online indicator */}
      <div className="flex items-center space-x-2 pt-2 border-t border-border/30">
        <Zap className="w-4 h-4 text-neon-green" />
        <span className="text-sm text-muted-foreground">Online agora</span>
      </div>
    </div>
  );
}
