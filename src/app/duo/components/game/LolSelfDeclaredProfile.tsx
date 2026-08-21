"use client";

import { Check, Crown, MapPin, Trophy } from "lucide-react";
import { GameMediaImage } from "@/components/media/GameMediaImage";
import { RiotDisclaimer } from "@/components/riot/RiotDisclaimer";
import { LolRankEmblemFrame } from "@/components/lol/LolRankEmblemFrame";
import { LolLaneRoleIcon } from "@/components/lol/LolLaneRoleIcon";
import { lolTierEmblemUrl } from "@/lib/lolRankedEmblem";
import { ranks } from "../../constants/ranks";

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

interface LolSelfDeclaredProfileProps {
  gameIcon?: string;
  gameName?: string;
  ownElo: string;
  mainRole: string;
  secondaryRole: string;
  onEloChange: (elo: string) => void;
  onMainRoleChange: (role: string) => void;
  onSecondaryRoleChange: (role: string) => void;
}

function LaneRolePicker({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (role: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mb-2 text-[11px] text-muted-foreground/90">{hint}</p>
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/25">
        <ul className="divide-y divide-border/40" role="list">
          {LOL_ROLES.map((role) => {
            const isSelected = value === role;
            return (
              <li key={role}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onChange(role)}
                  className={`flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
                    isSelected ? "bg-primary/[0.07]" : "hover:bg-muted/60 active:bg-muted/40"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/25 bg-transparent"
                    }`}
                    aria-hidden
                  >
                    {isSelected ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : null}
                  </span>
                  <LolLaneRoleIcon roleLabel={role} />
                  <span
                    className={`flex-1 text-sm font-medium sm:text-base ${
                      isSelected ? "text-foreground" : "text-card-foreground"
                    }`}
                  >
                    {role}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function LolSelfDeclaredProfile({
  gameIcon,
  gameName = "League of Legends",
  ownElo,
  mainRole,
  secondaryRole,
  onEloChange,
  onMainRoleChange,
  onSecondaryRoleChange,
}: LolSelfDeclaredProfileProps) {
  const rankColor = RANK_COLORS[ownElo] ?? "text-muted-foreground";
  const ownEloEmblem = ownElo ? lolTierEmblemUrl(ownElo) : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm backdrop-blur-sm sm:p-7">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {gameIcon ? (
            <GameMediaImage
              src={gameIcon}
              alt=""
              size="icon"
              className="h-16 w-16 shrink-0 rounded-2xl border-2 border-primary/25 bg-background/80 shadow-md ring-2 ring-primary/20"
              spinnerClassName="h-5 w-5"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow-primary ring-2 ring-primary/20">
              <MapPin className="h-7 w-7" />
            </div>
          )}
          <div>
            <p className="text-lg font-bold text-card-foreground sm:text-xl">{gameName}</p>
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
                zoomPercent={182}
              />
            ) : (
              <Crown className={`h-5 w-5 shrink-0 ${rankColor}`} />
            )}
            <span className={`font-semibold ${rankColor}`}>{ownElo}</span>
          </div>
        ) : null}
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
            {ranks.map((tier) => {
              const on = ownElo === tier;
              const emblem = lolTierEmblemUrl(tier);
              const tierColor = RANK_COLORS[tier] ?? "text-muted-foreground";
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
                      zoomPercent={182}
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
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Suas lanes</h3>
              <p className="text-xs text-muted-foreground">Como você aparece para outros jogadores</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
            <LaneRolePicker
              label="Lane principal"
              hint="Toque na lane para selecionar."
              value={mainRole}
              onChange={onMainRoleChange}
            />
            <LaneRolePicker
              label="Lane secundária"
              hint="Mesmo estilo do passo de funções do parceiro."
              value={secondaryRole}
              onChange={onSecondaryRoleChange}
            />
          </div>
        </div>
      </div>

      <RiotDisclaimer className="mt-6" />
    </div>
  );
}
