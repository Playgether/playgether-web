"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import type {
  LolBan,
  LolMatchDetail,
  LolStatsResponse,
} from "@/services/getLolStats";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function itemIconUrl(
  cdnBase: string | undefined,
  itemId: number,
): string | null {
  if (!itemId || !cdnBase) return null;
  return `${cdnBase}/img/item/${itemId}.png`;
}

function champIconUrl(
  championIconBase: string | undefined,
  image: string,
): string | null {
  if (!championIconBase || !image) return null;
  return `${championIconBase}/${image}`;
}

export function LolMatchHistoryDetail({
  detail,
  staticAssets,
}: {
  detail: LolMatchDetail;
  staticAssets: LolStatsResponse["staticAssets"] | undefined;
}) {
  const cdn = staticAssets?.cdnBase;
  const champBase = staticAssets?.championIconBase;
  const blue = detail.teams["100"];
  const red = detail.teams["200"];
  const blueWin = blue?.win ?? false;
  const redWin = red?.win ?? false;
  const showRank = Boolean(detail.showRankAndRole);
  const firstRedIndex = detail.participants.findIndex((p) => p.teamId === 200);

  return (
    <TooltipProvider delayDuration={120}>
      <div className="space-y-4 pt-3 text-sm border-t border-border/50">
        <div className="flex flex-wrap items-start justify-between gap-2 text-xs text-muted-foreground">
          <div>
            <span className="font-medium text-foreground text-sm">
              {detail.queueLabel}
            </span>
            {detail.isRemake ? (
              <p className="mt-1 text-sm font-bold text-zinc-400">Remake</p>
            ) : detail.viewerResult ? (
              <p
                className={`mt-1 text-sm font-bold ${
                  detail.viewerResult === "win"
                    ? "text-emerald-400"
                    : "text-rose-500"
                }`}
              >
                {detail.viewerResult === "win" ? "Vitória" : "Derrota"}
              </p>
            ) : null}
          </div>
          <span>
            {detail.gameVersion ? `Patch ${detail.gameVersion}` : null}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/60 bg-muted/50">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground">
                <th className="px-2 py-2 w-[220px]">Jogador</th>
                <th
                  className="px-2 py-2"
                  title="Abates / Mortes / Assistências"
                >
                  KDA
                </th>
                <th
                  className="px-2 py-2"
                  title="Participação em abates do time"
                >
                  P/Abate
                </th>
                <th
                  className="px-2 py-2"
                  title="Dano causado e recebido em campeões"
                >
                  Dano
                </th>
                <th
                  className="px-2 py-2"
                  title="Controle de visão e sentinelas"
                >
                  Visão
                </th>
                <th className="px-2 py-2" title="Farm total e por minuto">
                  CS
                </th>
                <th
                  className="px-2 py-2 min-w-[200px]"
                  title="Runas e itens da partida"
                >
                  Runas / Build
                </th>
              </tr>
            </thead>
            <tbody>
              {detail.participants.map((p, idx) => {
                const isBlue = p.teamId === 100;
                const border = isBlue
                  ? "border-l-[3px] border-l-sky-500"
                  : "border-l-[3px] border-l-red-600";
                const rowBg = isBlue ? "bg-sky-950/40" : "bg-red-950/40";
                const eloText = eloLabelFromParticipant(p);
                const laneText =
                  p.laneLabel && p.laneLabel !== "UNKNOWN"
                    ? p.laneLabel
                    : "";
                return (
                  <React.Fragment
                    key={p.puuid || `${p.riotId}-${p.championId}`}
                  >
                    {firstRedIndex > 0 && idx === firstRedIndex ? (
                      <tr className="border-y border-border/70 bg-red-950/50 text-muted-foreground">
                        <th className="px-2 py-2 w-[220px] text-left font-medium">
                          Jogador
                        </th>
                        <th className="px-2 py-2 text-left font-medium">KDA</th>
                        <th className="px-2 py-2 text-left font-medium">
                          P/Abate
                        </th>
                        <th className="px-2 py-2 text-left font-medium">
                          Dano
                        </th>
                        <th className="px-2 py-2 text-left font-medium">
                          Visão
                        </th>
                        <th className="px-2 py-2 text-left font-medium">CS</th>
                        <th className="px-2 py-2 min-w-[200px] text-left font-medium">
                          Runas / Build
                        </th>
                      </tr>
                    ) : null}
                    <tr
                      className={`border-b border-border/40 ${border} ${rowBg}`}
                    >
                      <td className="px-2 py-2 align-top">
                        <div className="flex items-start gap-2">
                          <div className="flex shrink-0 flex-col items-center gap-0.5">
                            <div className="relative">
                              {champIconUrl(champBase, p.championImage) ? (
                                <img
                                  src={
                                    champIconUrl(champBase, p.championImage)!
                                  }
                                  alt=""
                                  className="h-9 w-9 rounded border border-border/60"
                                />
                              ) : (
                                <div className="h-9 w-9 rounded bg-muted" />
                              )}
                              <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 rounded bg-black/90 px-1 text-[10px] text-white">
                                {p.summonerLevel}
                              </span>
                            </div>
                            <div className="flex justify-center gap-0.5">
                              <WithTooltip
                                text={spellTooltip(
                                  p.summonerSpell1Name,
                                  p.summonerSpell1Description,
                                )}
                              >
                                {p.summonerSpell1Url ? (
                                  <img
                                    src={p.summonerSpell1Url}
                                    alt=""
                                    className="h-4 w-4 rounded-sm border border-zinc-500/80"
                                  />
                                ) : (
                                  <span className="h-4 w-4 rounded-sm border border-zinc-600/80 bg-zinc-900/80" />
                                )}
                              </WithTooltip>
                              <WithTooltip
                                text={spellTooltip(
                                  p.summonerSpell2Name,
                                  p.summonerSpell2Description,
                                )}
                              >
                                {p.summonerSpell2Url ? (
                                  <img
                                    src={p.summonerSpell2Url}
                                    alt=""
                                    className="h-4 w-4 rounded-sm border border-zinc-500/80"
                                  />
                                ) : (
                                  <span className="h-4 w-4 rounded-sm border border-zinc-600/80 bg-zinc-900/80" />
                                )}
                              </WithTooltip>
                            </div>
                          </div>
                          <div className="-mt-0.5 flex min-w-0 flex-col gap-0.5">
                            <span
                              className={`block truncate text-left font-medium text-[11px] ${
                                p.puuid &&
                                detail.viewerPuuid &&
                                p.puuid === detail.viewerPuuid
                                  ? "text-amber-400"
                                  : "text-foreground"
                              }`}
                              title={p.riotId}
                            >
                              {p.gameName}
                              {p.tagLine ? (
                                <span className="text-muted-foreground">
                                  #{p.tagLine}
                                </span>
                              ) : null}
                            </span>
                            {showRank &&
                            (p.rankTierIconUrl || eloText || laneText) ? (
                              <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] leading-tight text-muted-foreground">
                                <span className="inline-flex min-w-0 max-w-full items-center gap-1">
                                  {p.rankTierIconUrl ? (
                                    <WithTooltip
                                      text={
                                        eloText
                                          ? `${eloText} — elo na época da partida (ranqueada)`
                                          : p.rankLine ||
                                            "Elo na época da partida"
                                      }
                                    >
                                      <span className="relative mt-px flex h-4 w-4 shrink-0 overflow-hidden rounded-[3px] bg-transparent">
                                        <img
                                          src={p.rankTierIconUrl}
                                          alt=""
                                          className="absolute left-1/2 top-1/2 h-[340%] w-[340%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-[center_40%]"
                                        />
                                      </span>
                                    </WithTooltip>
                                  ) : null}
                                  {eloText ? (
                                    <span className="min-w-0 truncate font-medium text-foreground/85">
                                      {eloText}
                                    </span>
                                  ) : null}
                                </span>
                                {laneText ? (
                                  <>
                                    <span
                                      className="shrink-0 text-muted-foreground/60"
                                      aria-hidden
                                    >
                                      ·
                                    </span>
                                    <span className="inline-flex min-w-0 max-w-full items-center gap-1">
                                      {p.laneIconUrl ? (
                                        <WithTooltip
                                          text={`${laneText} — posição na partida`}
                                        >
                                          <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-transparent">
                                            <img
                                              src={p.laneIconUrl}
                                              alt=""
                                              className="h-[118%] w-[118%] max-w-none object-cover object-center"
                                            />
                                          </span>
                                        </WithTooltip>
                                      ) : null}
                                      <span className="truncate font-medium text-foreground/85">
                                        {laneText}
                                      </span>
                                    </span>
                                  </>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 align-top whitespace-nowrap">
                        <div className="font-semibold tabular-nums">
                          {p.kills} /{" "}
                          <span className="text-rose-400">{p.deaths}</span> /{" "}
                          {p.assists}
                        </div>
                        <div className="text-muted-foreground">
                          {p.kdaRatio.toFixed(2)}:1
                        </div>
                      </td>
                      <td className="px-2 py-2 align-top tabular-nums">
                        {p.killParticipationPct}%
                      </td>
                      <td className="px-2 py-2 align-top min-w-[120px]">
                        <div
                          className="tabular-nums"
                          title="Dano causado em campeões"
                        >
                          Causado {p.damageDealtToChampions.toLocaleString()}
                        </div>
                        <div
                          className="text-[10px] text-muted-foreground"
                          title="Dano recebido de campeões"
                        >
                          Recebido {p.damageTaken.toLocaleString()}
                        </div>
                        <Progress
                          value={p.damageTeamPctBar}
                          className="mt-1 h-1"
                        />
                      </td>
                      <td className="px-2 py-2 align-top text-[11px] leading-tight">
                        <div>Pink {p.controlWardsPurchased}</div>
                        <div className="text-muted-foreground">
                          {p.wardsPlaced} / {p.wardsKilled}
                        </div>
                        <div>Score {p.visionScore}</div>
                      </td>
                      <td className="px-2 py-2 align-top tabular-nums whitespace-nowrap">
                        <div>{p.cs}</div>
                        <div className="text-muted-foreground">
                          {p.csPerMinute}/m
                        </div>
                      </td>
                      <td className="px-2 py-2 align-top">
                        <div className="mb-1 flex flex-wrap gap-0.5">
                          {p.runes?.map((r) => (
                            <WithTooltip
                              key={`${p.puuid}-r-build-${r.id}`}
                              text={spellTooltip(
                                r.name || `Runa ${r.id}`,
                                r.description,
                              )}
                            >
                              <img
                                src={r.iconUrl}
                                alt=""
                                className="h-4 w-4 rounded-full border border-zinc-500/70 bg-black/30"
                              />
                            </WithTooltip>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-0.5">
                          {p.items.map((id, idx) =>
                            itemIconUrl(cdn, id) ? (
                              <WithTooltip
                                key={`${p.puuid}-it-${idx}`}
                                text={spellTooltip(
                                  p.itemsDetailed?.[idx]?.name || `Item ${id}`,
                                  p.itemsDetailed?.[idx]?.description,
                                )}
                              >
                                <img
                                  src={itemIconUrl(cdn, id)!}
                                  alt=""
                                  className="h-6 w-6 rounded-sm border border-zinc-500/80"
                                />
                              </WithTooltip>
                            ) : (
                              <div
                                key={`${p.puuid}-it-${idx}`}
                                className="h-6 w-6 rounded-sm border-2 border-dashed border-zinc-400 bg-zinc-900/80"
                              />
                            ),
                          )}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <TeamPanel
            title="Equipe azul"
            win={blueWin}
            accentTitleClass="text-sky-700 dark:text-sky-200"
            panelClass="border-sky-600/70 bg-sky-950/45"
            objectives={blue?.objectives}
            kills={detail.summary.blueKills}
            gold={detail.summary.blueGold}
            bans={blue?.bans}
            champBase={champBase}
          />
          <TeamPanel
            title="Equipe vermelha"
            win={redWin}
            accentTitleClass="text-red-700 dark:text-red-200"
            panelClass="border-red-600/70 bg-red-950/45"
            objectives={red?.objectives}
            kills={detail.summary.redKills}
            gold={detail.summary.redGold}
            bans={red?.bans}
            champBase={champBase}
          />
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <div className="flex justify-between text-muted-foreground mb-1">
              <span>Total de abates</span>
              <span>
                {detail.summary.blueKills} — {detail.summary.redKills}
              </span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="bg-blue-500"
                style={{ width: `${detail.summary.killBarBluePct}%` }}
              />
              <div
                className="bg-red-500"
                style={{ width: `${detail.summary.killBarRedPct}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-muted-foreground mb-1">
              <span>Ouro total</span>
              <span>
                {detail.summary.blueGold.toLocaleString()} —{" "}
                {detail.summary.redGold.toLocaleString()}
              </span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="bg-blue-500"
                style={{ width: `${detail.summary.goldBarBluePct}%` }}
              />
              <div
                className="bg-red-500"
                style={{ width: `${detail.summary.goldBarRedPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function TeamPanel({
  title,
  win,
  accentTitleClass,
  panelClass,
  objectives,
  kills,
  gold,
  bans,
  champBase,
}: {
  title: string;
  win: boolean;
  accentTitleClass: string;
  panelClass: string;
  objectives?: Record<string, number>;
  kills: number;
  gold: number;
  bans?: LolBan[];
  champBase: string | undefined;
}) {
  return (
    <div className={`rounded-lg border p-3 ${panelClass}`}>
      <div className={`font-semibold capitalize ${accentTitleClass}`}>
        {title}
      </div>
      <div
        className={`mt-1 text-sm font-bold ${win ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-500"}`}
      >
        {win ? "Vitória" : "Derrota"}
      </div>
      <ObjectivesList objectives={objectives} />
      <BansList bans={bans} champBase={champBase} />
      <div className="mt-2 text-muted-foreground">
        {kills} kills · {gold.toLocaleString()} ouro
      </div>
    </div>
  );
}

function BansList({
  bans,
  champBase,
}: {
  bans?: LolBan[];
  champBase: string | undefined;
}) {
  if (!bans?.length) return null;
  return (
    <div className="mt-3">
      <div className="text-[10px] font-medium text-muted-foreground mb-1">
        Banimentos
      </div>
      <div className="flex flex-wrap gap-0.5">
        {bans.map((b) =>
          champIconUrl(champBase, b.championImage) ? (
            <img
              key={`ban-${b.championId}`}
              src={champIconUrl(champBase, b.championImage)!}
              title={b.championName}
              alt=""
              className="h-6 w-6 rounded-sm border border-zinc-500/80 opacity-70 grayscale-[0.15]"
            />
          ) : (
            <div
              key={`ban-${b.championId}`}
              className="h-6 w-6 rounded-sm border border-dashed border-zinc-500 bg-zinc-900/80 text-[9px] flex items-center justify-center text-muted-foreground"
            >
              ?
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function ObjectivesList({
  objectives,
}: {
  objectives?: Record<string, number>;
}) {
  if (!objectives || !Object.keys(objectives).length) {
    return <p className="text-muted-foreground mt-2">Sem dados de objetivos</p>;
  }
  const labels: Record<string, string> = {
    baron: "Barão",
    dragon: "Dragão",
    riftHerald: "Arauto",
    tower: "Torres",
    inhibitor: "Inibidores",
    horde: "Voidgrubs",
  };
  return (
    <ul className="mt-2 space-y-1 text-muted-foreground">
      {Object.entries(objectives)
        .filter(([key]) => key !== "atakhan" && key !== "champion")
        .map(([key, val]) => (
          <li key={key} className="flex justify-between gap-2">
            <span>{labels[key] ?? key}</span>
            <span className="tabular-nums text-foreground">{val}</span>
          </li>
        ))}
    </ul>
  );
}

function WithTooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  if (!text) return <span>{children}</span>;
  const [title, ...rest] = text.split(" - ");
  const description = rest.join(" - ");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-help">{children}</span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[340px] whitespace-normal text-[11px] leading-snug"
      >
        <div className="font-semibold text-foreground">
          {title || "Detalhe"}
        </div>
        {description ? (
          <div className="mt-1 text-muted-foreground">{description}</div>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}

function spellTooltip(name?: string, description?: string) {
  if (!name && !description) return "";
  const cleanDesc = description ? normalizeTooltipDescription(description).trim() : "";
  if (!cleanDesc) {
    return (name || "").trim();
  }
  return `${name || ""} - ${cleanDesc}`.trim();
}

function eloLabelFromParticipant(p: {
  rankDisplay?: string | null;
  rankLine?: string | null;
}): string {
  const d = (p.rankDisplay ?? "").trim();
  if (d) return d;
  const line = (p.rankLine ?? "").trim();
  if (!line) return "";
  const parts = line.split(/\s*·\s*/);
  return (parts[0] ?? line).trim();
}

function normalizeTooltipDescription(description: string): string {
  return description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n/g, " ")
    .trim();
}
