"use client";

import { Crosshair, Clock, CrosshairIcon, Target, UserCog, Zap } from "lucide-react";
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

  const rangeChip = (r: string) => {
    const on = ownRange === r;
    return (
      <button
        type="button"
        key={r}
        aria-pressed={on}
        onClick={() => onRangeChange(r)}
        className={`rounded-full border px-3 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 sm:text-sm ${
          on
            ? "border-primary/70 bg-primary/20 text-primary shadow-glow-primary/25"
            : "border-border/70 bg-background/45 text-muted-foreground hover:border-primary/35 hover:text-card-foreground"
        }`}
      >
        {r}
      </button>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm backdrop-blur-sm sm:p-7">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {stats.avatar ? (
            <img
              src={stats.avatar}
              alt={stats.nickname ?? "Avatar"}
              className="h-16 w-16 shrink-0 rounded-2xl border-2 border-primary/25 object-cover shadow-md"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-glow-primary ring-2 ring-primary/20">
              {stats.nickname?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <p className="text-lg font-bold text-card-foreground sm:text-xl">
              {stats.nickname ?? "Steam User"}
            </p>
            <p className="text-sm text-muted-foreground">Counter-Strike 2</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-border/40 bg-gradient-to-b from-primary/12 to-transparent px-2 py-3 text-center">
          <Target className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-lg font-bold text-primary sm:text-xl">{stats.kd ?? "—"}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">K/D</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-gradient-to-b from-primary/12 to-transparent px-2 py-3 text-center">
          <Crosshair className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-lg font-bold text-primary sm:text-xl">
            {stats.hs_percent != null ? `${stats.hs_percent}%` : "—"}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">HS%</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-gradient-to-b from-primary/12 to-transparent px-2 py-3 text-center">
          <Clock className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-lg font-bold text-primary sm:text-xl">
            {stats.hours_played != null ? `${stats.hours_played}h` : "—"}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">Horas</p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/12 text-sky-400 ring-1 ring-sky-500/25">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Pontuação Premier</h3>
              <p className="text-xs text-muted-foreground">Sua faixa atual no modo Premier</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">{PREMIER_RANGES.map((r) => rangeChip(r))}</div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
              <UserCog className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Funções</h3>
              <p className="text-xs text-muted-foreground">Até 2 funções na sua identidade de duo</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {CS_ROLES.map((role) => {
              const selected = selectedRoles.includes(role);
              const disabled = !selected && selectedRoles.length >= 2;
              return (
                <button
                  type="button"
                  key={role}
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => !disabled && toggleRole(role)}
                  className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 sm:text-sm ${
                    selected
                      ? "border-primary/70 bg-primary/20 text-primary shadow-glow-primary/25"
                      : disabled
                        ? "cursor-not-allowed border-border/40 bg-muted/20 text-muted-foreground opacity-45"
                        : "border-border/70 bg-background/45 text-muted-foreground hover:border-primary/35 hover:text-card-foreground"
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/12 text-violet-400 ring-1 ring-violet-500/25">
              <CrosshairIcon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Armas favoritas</h3>
              <p className="text-xs text-muted-foreground">Até 3 armas para destacar no perfil</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {CS_WEAPONS.map((weapon) => {
              const selected = selectedWeapons.includes(weapon);
              const disabled = !selected && selectedWeapons.length >= 3;
              return (
                <button
                  type="button"
                  key={weapon}
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => !disabled && toggleWeapon(weapon)}
                  className={`rounded-full border px-3 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/45 sm:text-sm ${
                    selected
                      ? "border-secondary/80 bg-secondary/25 text-secondary-foreground shadow-md"
                      : disabled
                        ? "cursor-not-allowed border-border/40 bg-muted/20 text-muted-foreground opacity-45"
                        : "border-border/70 bg-background/45 text-muted-foreground hover:border-secondary/40 hover:text-card-foreground"
                  }`}
                >
                  {weapon}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
