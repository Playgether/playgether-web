"use client";

import { useEffect, useMemo } from "react";
import { Crown, Info, Shield, Swords, Trophy } from "lucide-react";
import { LolRankEmblemFrame } from "@/components/lol/LolRankEmblemFrame";
import { ValorantRoleIcon } from "@/components/valorant/ValorantRoleIcon";
import { valorantTierEmblemUrl } from "@/lib/valorantRankEmblem";
import { VAL_RANK_COLORS, VAL_ROLES, VAL_TIERS } from "../../constants/valorant";

const VAL_ROLE_SET = new Set<string>(VAL_ROLES);

function normalizeValRoles(roles: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const role of roles) {
    if (!VAL_ROLE_SET.has(role) || seen.has(role)) continue;
    seen.add(role);
    out.push(role);
    if (out.length >= 2) break;
  }
  return out;
}

interface ValorantProfileProps {
  ownElo: string;
  selectedRoles: string[];
  onEloChange: (elo: string) => void;
  onRolesChange: (roles: string[]) => void;
}

export function ValorantProfile({
  ownElo,
  selectedRoles,
  onEloChange,
  onRolesChange,
}: ValorantProfileProps) {
  const validSelectedRoles = useMemo(
    () => normalizeValRoles(selectedRoles),
    [selectedRoles],
  );

  useEffect(() => {
    if (
      validSelectedRoles.length !== selectedRoles.length ||
      validSelectedRoles.some((role, index) => role !== selectedRoles[index])
    ) {
      onRolesChange(validSelectedRoles);
    }
  }, [validSelectedRoles, selectedRoles, onRolesChange]);

  const rankColor = VAL_RANK_COLORS[ownElo] ?? "text-muted-foreground";
  const ownEloEmblem = ownElo ? valorantTierEmblemUrl(ownElo) : null;

  const toggleRole = (role: string) =>
    onRolesChange(
      validSelectedRoles.includes(role)
        ? validSelectedRoles.filter((r) => r !== role)
        : validSelectedRoles.length >= 2
          ? validSelectedRoles
          : [...validSelectedRoles, role],
    );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm backdrop-blur-sm sm:p-7">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow-primary ring-2 ring-primary/20">
            <Swords className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-bold text-card-foreground sm:text-xl">VALORANT</p>
            <p className="text-sm text-muted-foreground">Perfil de duo informado por você</p>
          </div>
        </div>
        {ownElo ? (
          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/30 px-4 py-3">
            {ownEloEmblem ? (
              <LolRankEmblemFrame
                src={ownEloEmblem}
                alt={`Emblema — ${ownElo}`}
                frameClass="h-11 w-11"
                zoomPercent={118}
              />
            ) : (
              <Crown className={`h-5 w-5 shrink-0 ${rankColor}`} />
            )}
            <span className={`font-semibold ${rankColor}`}>{ownElo}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-3.5 py-3 text-sm text-amber-100/90">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <p>
          O elo e as funções não vêm da Riot. Informe o que você joga para os outros
          encontrarem um duo compatível.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/12 text-amber-400 ring-1 ring-amber-500/25">
              <Trophy className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Seu elo</h3>
              <p className="text-xs text-muted-foreground">O rank que aparece no seu card de duo</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {VAL_TIERS.map((tier) => {
              const on = ownElo === tier;
              const emblem = valorantTierEmblemUrl(tier);
              const tierColor = VAL_RANK_COLORS[tier] ?? "text-muted-foreground";
              return (
                <button
                  type="button"
                  key={tier}
                  aria-pressed={on}
                  onClick={() => onEloChange(tier)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 sm:px-3 sm:py-2 sm:text-sm ${
                    on
                      ? "border-primary/70 bg-primary/20 text-primary shadow-glow-primary/25"
                      : "border-border/70 bg-background/45 text-muted-foreground hover:border-primary/35 hover:text-card-foreground"
                  }`}
                >
                  {emblem ? (
                    <LolRankEmblemFrame
                      src={emblem}
                      alt=""
                      frameClass="h-7 w-7 shrink-0"
                      zoomPercent={118}
                    />
                  ) : null}
                  <span className={on ? undefined : tierColor}>{tier}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
              <Shield className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Funções</h3>
              <p className="text-xs text-muted-foreground">Até 2 funções na sua identidade de duo</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {VAL_ROLES.map((role) => {
              const selected = validSelectedRoles.includes(role);
              const disabled = !selected && validSelectedRoles.length >= 2;
              return (
                <button
                  type="button"
                  key={role}
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => {
                    if (!disabled) toggleRole(role);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 sm:text-sm ${
                    selected
                      ? "border-primary/70 bg-primary/20 text-primary shadow-glow-primary/25"
                      : disabled
                        ? "cursor-not-allowed border-border/40 bg-muted/50 text-muted-foreground opacity-45"
                        : "border-border/70 bg-background/45 text-muted-foreground hover:border-primary/35 hover:text-card-foreground"
                  }`}
                >
                  <ValorantRoleIcon roleLabel={role} className="h-4 w-4" />
                  {role}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
