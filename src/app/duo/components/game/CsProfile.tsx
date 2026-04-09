"use client";

import { Badge } from "@/components/ui/badge";
import { Crosshair, Clock, Target } from "lucide-react";
import type { CsStats } from "../../types/duo";

const CS_ROLES = [
  "AWPer",
  "Entry",
  "Second Entry",
  "Support",
  "Lurker",
  "IGL",
] as const;

const CS_WEAPONS = [
  "AK-47", "M4A4", "M4A1-S", "AWP", "Desert Eagle",
  "USP-S", "Glock", "MP5-SD", "MP9", "SG 553",
] as const;

const PREMIER_RANGES = [
  "0-4999", "5000-9999", "10000-14999",
  "15000-19999", "20000-24999", "25000-29999", "30000+",
] as const;

interface CsProfileProps {
  stats: CsStats;
  selectedRoles: string[];
  selectedWeapons: string[];
  ownRange: string;
  onRolesChange: (roles: string[]) => void;
  onWeaponsChange: (weapons: string[]) => void;
  onRangeChange: (range: string) => void;
}

export function CsProfile({
  stats,
  selectedRoles,
  selectedWeapons,
  ownRange,
  onRolesChange,
  onWeaponsChange,
  onRangeChange,
}: CsProfileProps) {
  const toggleRole = (role: string) =>
    onRolesChange(
      selectedRoles.includes(role)
        ? selectedRoles.filter((r) => r !== role)
        : [...selectedRoles, role]
    );

  const toggleWeapon = (weapon: string) => {
    if (selectedWeapons.includes(weapon)) {
      onWeaponsChange(selectedWeapons.filter((w) => w !== weapon));
    } else if (selectedWeapons.length < 3) {
      onWeaponsChange([...selectedWeapons, weapon]);
    }
  };

  return (
    <div className="card-glass rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center space-x-4">
        {stats.avatar ? (
          <img
            src={stats.avatar}
            alt={stats.nickname ?? "avatar"}
            className="w-16 h-16 rounded-full border-2 border-primary/30 object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground">
            {stats.nickname?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div>
          <p className="text-xl font-bold text-card-foreground">{stats.nickname ?? "Steam User"}</p>
          <p className="text-muted-foreground text-sm">Counter-Strike 2</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-muted/20 rounded-lg p-2">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Target className="w-3 h-3 text-muted-foreground" />
          </div>
          <p className="text-primary font-bold text-lg">{stats.kd ?? "—"}</p>
          <p className="text-muted-foreground text-xs">K/D</p>
        </div>
        <div className="bg-muted/20 rounded-lg p-2">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Crosshair className="w-3 h-3 text-muted-foreground" />
          </div>
          <p className="text-primary font-bold text-lg">
            {stats.hs_percent != null ? `${stats.hs_percent}%` : "—"}
          </p>
          <p className="text-muted-foreground text-xs">HS%</p>
        </div>
        <div className="bg-muted/20 rounded-lg p-2">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
          </div>
          <p className="text-primary font-bold text-lg">
            {stats.hours_played != null ? `${stats.hours_played}h` : "—"}
          </p>
          <p className="text-muted-foreground text-xs">Horas</p>
        </div>
      </div>

      {/* Premier range */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">
          Pontuação Premier
        </label>
        <div className="flex flex-wrap gap-2">
          {PREMIER_RANGES.map((r) => (
            <Badge
              key={r}
              variant={ownRange === r ? "default" : "outline"}
              className={`cursor-pointer transition-all duration-200 ${
                ownRange === r
                  ? "bg-primary text-primary-foreground"
                  : "hover:border-primary/50 text-muted-foreground"
              }`}
              onClick={() => onRangeChange(r)}
            >
              {r}
            </Badge>
          ))}
        </div>
      </div>

      {/* Roles (max 2) */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">
          Funções (máx. 2)
        </label>
        <div className="flex flex-wrap gap-2">
          {CS_ROLES.map((role) => {
            const selected = selectedRoles.includes(role);
            const disabled = !selected && selectedRoles.length >= 2;
            return (
              <Badge
                key={role}
                variant={selected ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : disabled
                    ? "opacity-40 cursor-not-allowed text-muted-foreground"
                    : "hover:border-primary/50 text-muted-foreground"
                }`}
                onClick={() => !disabled && toggleRole(role)}
              >
                {role}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Favorite weapons (max 3) */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">
          Armas favoritas (máx. 3)
        </label>
        <div className="flex flex-wrap gap-2">
          {CS_WEAPONS.map((weapon) => {
            const selected = selectedWeapons.includes(weapon);
            const disabled = !selected && selectedWeapons.length >= 3;
            return (
              <Badge
                key={weapon}
                variant={selected ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 text-xs ${
                  selected
                    ? "bg-secondary text-secondary-foreground"
                    : disabled
                    ? "opacity-40 cursor-not-allowed text-muted-foreground"
                    : "hover:border-secondary/50 text-muted-foreground"
                }`}
                onClick={() => !disabled && toggleWeapon(weapon)}
              >
                {weapon}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
