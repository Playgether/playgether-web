"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Crosshair,
  Loader2,
  Map,
  Swords,
  Target,
  Trophy,
  TrendingUp,
} from "lucide-react";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";

// ---- Types ----

type GameId = "valorant" | "lol" | "csgo";
type GameType = "fps" | "moba";

interface Season {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
}

interface FpsStats {
  kd: number;
  kda: string; // "1.28:1"
  winRate: number;
  headshotPct: number;
  bodyShotPct: number;
  legShotPct: number;
  currentElo: string;
  previousSeasonElo: string;
  peakElo: string;
  totalHours: number;
  seasonHours: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  seasonKills: number;
  seasonDeaths: number;
  seasonAssists: number;
  weapons: { name: string; kills: number; pct: number }[];
  mapWinRates: { map: string; winPct: number; wins: number; losses: number }[];
}

interface LolStats {
  kda: string;
  winRate: number;
  currentRank: string;
  lp: number;
  previousSeasonRank: string;
  peakRank: string;
  totalHours: number;
  seasonHours: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  seasonKills: number;
  seasonDeaths: number;
  seasonAssists: number;
  champions: { name: string; games: number; winPct: number; kda: string }[];
  roles: { role: string; games: number; winPct: number }[];
}

interface Match {
  id: string;
  map: string;
  result: "win" | "loss";
  score: string;
  kda: string;
  date: string;
  duration: string;
  expandedDetails?: {
    kills: number;
    deaths: number;
    assists: number;
    headshotPct?: number;
    adr?: number;
    acs?: number;
    firstBloods?: number;
    mvps?: number;
    damage?: number;
    cs?: number;
    vision?: number;
    gold?: number;
  };
}

// ---- Mock Data ----

const seasons: Season[] = [
  { id: "s1", label: "EP08 - ACT3", startDate: "2025-01-15", endDate: "2025-03-15" },
  { id: "s2", label: "EP08 - ACT2", startDate: "2024-11-20", endDate: "2025-01-14" },
  { id: "s3", label: "EP08 - ACT1", startDate: "2024-10-01", endDate: "2024-11-19" },
  { id: "s4", label: "EP07 - ACT3", startDate: "2024-08-15", endDate: "2024-09-30" },
];

const fpsStatsS1: FpsStats = {
  kd: 1.28,
  kda: "1.28:1",
  winRate: 63,
  headshotPct: 64,
  bodyShotPct: 28,
  legShotPct: 8,
  currentElo: "11,173",
  previousSeasonElo: "10,892",
  peakElo: "12,450",
  totalHours: 1247,
  seasonHours: 42,
  totalKills: 488,
  totalDeaths: 391,
  totalAssists: 96,
  seasonKills: 312,
  seasonDeaths: 248,
  seasonAssists: 58,
  weapons: [
    { name: "AK-47", kills: 176, pct: 36 },
    { name: "M4A4", kills: 105, pct: 21 },
    { name: "AWP", kills: 82, pct: 17 },
    { name: "Desert Eagle", kills: 45, pct: 9 },
  ],
  mapWinRates: [
    { map: "Mirage", winPct: 91, wins: 10, losses: 1 },
    { map: "Dust2", winPct: 67, wins: 8, losses: 4 },
    { map: "Inferno", winPct: 50, wins: 5, losses: 5 },
    { map: "Overpass", winPct: 33, wins: 2, losses: 4 },
  ],
};

const fpsStatsS2: FpsStats = {
  kd: 1.15,
  kda: "1.15:1",
  winRate: 58,
  headshotPct: 61,
  bodyShotPct: 31,
  legShotPct: 8,
  currentElo: "10,892",
  previousSeasonElo: "10,200",
  peakElo: "11,500",
  totalHours: 1205,
  seasonHours: 38,
  totalKills: 420,
  totalDeaths: 365,
  totalAssists: 82,
  seasonKills: 265,
  seasonDeaths: 230,
  seasonAssists: 45,
  weapons: [
    { name: "AK-47", kills: 150, pct: 35 },
    { name: "M4A4", kills: 95, pct: 22 },
    { name: "AWP", kills: 70, pct: 16 },
  ],
  mapWinRates: [
    { map: "Mirage", winPct: 85, wins: 11, losses: 2 },
    { map: "Dust2", winPct: 60, wins: 6, losses: 4 },
  ],
};

const fpsStatsBySeason: Record<string, FpsStats> = {
  s1: fpsStatsS1,
  s2: fpsStatsS2,
  s3: { ...fpsStatsS1, currentElo: "10,200", previousSeasonElo: "9,800", peakElo: "10,500" },
  s4: { ...fpsStatsS1, currentElo: "9,800", previousSeasonElo: "9,200", peakElo: "10,100" },
};

const lolStatsS1: LolStats = {
  kda: "2.45:1",
  winRate: 58,
  currentRank: "Diamond 2",
  lp: 45,
  previousSeasonRank: "Platinum 1",
  peakRank: "Diamond 1",
  totalHours: 890,
  seasonHours: 65,
  totalKills: 3420,
  totalDeaths: 1850,
  totalAssists: 4120,
  seasonKills: 245,
  seasonDeaths: 132,
  seasonAssists: 298,
  champions: [
    { name: "Aphelios", games: 45, winPct: 62, kda: "2.8:1" },
    { name: "Ahri", games: 32, winPct: 66, kda: "2.4:1" },
    { name: "Jinx", games: 28, winPct: 54, kda: "2.1:1" },
    { name: "Viktor", games: 22, winPct: 50, kda: "2.6:1" },
  ],
  roles: [
    { role: "ADC", games: 68, winPct: 59 },
    { role: "Mid", games: 45, winPct: 56 },
    { role: "Top", games: 12, winPct: 50 },
  ],
};

const lolStatsBySeason: Record<string, LolStats> = {
  s1: lolStatsS1,
  s2: { ...lolStatsS1, currentRank: "Platinum 1", lp: 78 },
  s3: { ...lolStatsS1, currentRank: "Platinum 2", lp: 32 },
  s4: { ...lolStatsS1, currentRank: "Gold 1", lp: 95 },
};

const generateMatches = (gameId: GameId, count: number, offset = 0): Match[] => {
  const maps =
    gameId === "csgo"
      ? ["Mirage", "Dust2", "Inferno", "Overpass", "Nuke", "Ancient"]
      : gameId === "valorant"
        ? ["Ascent", "Bind", "Haven", "Split", "Icebox"]
        : ["Summoner's Rift"];
  const results: ("win" | "loss")[] = ["win", "loss"];
  const dates = ["2h atrás", "5h atrás", "1d atrás", "2d atrás", "3d atrás", "5d atrás", "1 sem atrás"];

  return Array.from({ length: count }, (_, i) => {
    const idx = offset + i;
    const map = maps[idx % maps.length];
    const result = results[idx % 2];
    const score = result === "win" ? "13-9" : "11-13";
    const kills = 12 + (idx % 12);
    const deaths = 10 + (idx % 10);
    const assists = 4 + (idx % 6);
    return {
      id: `m-${gameId}-${offset + i}`,
      map,
      result,
      score,
      kda: `${kills}/${deaths}/${assists}`,
      date: dates[idx % dates.length],
      duration: `${25 + (idx % 15)}m`,
      expandedDetails: {
        kills,
        deaths,
        assists,
        headshotPct: gameId !== "lol" ? 55 + (idx % 25) : undefined,
        adr: gameId !== "lol" ? 75 + idx * 2 : undefined,
        acs: gameId === "valorant" ? 180 + idx * 3 : undefined,
        firstBloods: gameId !== "lol" ? (idx % 3) : undefined,
        mvps: gameId !== "lol" ? (idx % 2) : undefined,
        damage: gameId === "lol" ? 18000 + idx * 200 : undefined,
        cs: gameId === "lol" ? 150 + idx * 10 : undefined,
        vision: gameId === "lol" ? 25 + (idx % 15) : undefined,
        gold: gameId === "lol" ? 11000 + idx * 100 : undefined,
      },
    };
  });
};

// ---- Component ----

interface ProfileGameStatsSectionProps {
  selectedGame: GameId;
  profile: getProfileByUsernameProps | null;
}

export function ProfileGameStatsSection({
  selectedGame,
  profile,
}: ProfileGameStatsSectionProps) {
  const [statsTab, setStatsTab] = useState("overview");
  const [season, setSeason] = useState("s1");
  const [competitiveOnly, setCompetitiveOnly] = useState(true);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [matchesLoaded, setMatchesLoaded] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);

  const gameType: GameType = selectedGame === "lol" ? "moba" : "fps";
  const displayName =
    selectedGame === "valorant"
      ? "Valorant"
      : selectedGame === "lol"
        ? "League of Legends"
        : "CS2";
  const profileNick =
    selectedGame === "csgo"
      ? profile?.name || "Player"
      : profile?.name || "Player";
  const profileAvatar = profile?.profile_photo || "/profile/perfil.jpg";

  const fpsStats = fpsStatsBySeason[season] ?? fpsStatsBySeason["s1"];
  const lolStats = lolStatsBySeason[season] ?? lolStatsBySeason["s1"];

  const allMatches = generateMatches(selectedGame, matchesLoaded);
  const matchesToShow = competitiveOnly
    ? allMatches
    : allMatches; // No filtro real, só UI

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setMatchesLoaded((prev) => prev + 10);
      setLoadingMore(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Player header - profile icon + nick */}
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="h-14 w-14 border-2 border-border ring-2 ring-primary/20">
          <AvatarImage src={profileAvatar} alt={profileNick} />
          <AvatarFallback className="bg-gradient-primary text-white font-bold">
            {profileNick.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">
            {profileNick}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedGame === "csgo" ? "Steam" : selectedGame === "valorant" ? "Riot ID" : "Summoner"}
            {" · "}
            {displayName}
          </p>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={season} onValueChange={setSeason}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Temporada" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={competitiveOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setCompetitiveOnly(!competitiveOnly)}
          className={
            competitiveOnly
              ? "bg-gradient-primary text-white border-0"
              : "border-border"
          }
        >
          Competitivo
        </Button>
        {!competitiveOnly && (
          <Button
            variant="outline"
            size="sm"
            className="border-border"
            onClick={() => setCompetitiveOnly(true)}
          >
            Todos
          </Button>
        )}
      </div>

      <Tabs value={statsTab} onValueChange={setStatsTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card border border-border">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="matches"
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
          >
            Partidas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {gameType === "fps" ? (
            <FpsOverview stats={fpsStats} />
          ) : (
            <LolOverview stats={lolStats} />
          )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-4 mt-6">
          <MatchHistory
            matches={matchesToShow}
            gameId={selectedGame}
            expandedMatch={expandedMatch}
            onToggleExpand={setExpandedMatch}
            onLoadMore={handleLoadMore}
            loadingMore={loadingMore}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---- FPS Overview ----

function FpsOverview({ stats }: { stats: FpsStats }) {
  return (
    <div className="space-y-6">
      {/* Core stats - bento grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Target className="h-4 w-4" />}
          label="K/D"
          value={stats.kd.toFixed(2)}
          accent="text-neon-green"
        />
        <StatCard
          icon={<Crosshair className="h-4 w-4" />}
          label="HS%"
          value={`${stats.headshotPct}%`}
          accent="text-neon-blue"
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Win Rate"
          value={`${stats.winRate}%`}
          accent="text-neon-purple"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Elo Atual"
          value={stats.currentElo}
          accent="text-neon-pink"
          subValue="Premier"
        />
      </div>

      {/* Elo evolution + Shot distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border overflow-hidden">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progresso de Elo
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Anterior</span>
                <span className="font-medium">{stats.previousSeasonElo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pico</span>
                <span className="font-medium text-neon-green">{stats.peakElo}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border overflow-hidden">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Crosshair className="h-4 w-4" />
              Distribuição de Tiros
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs">Cabeça {stats.headshotPct}%</span>
                <Progress value={stats.headshotPct} className="flex-1 h-2" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs">Corpo {stats.bodyShotPct}%</span>
                <Progress value={stats.bodyShotPct} className="flex-1 h-2" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-xs">Pernas {stats.legShotPct}%</span>
                <Progress value={stats.legShotPct} className="flex-1 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KDA + Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Swords className="h-4 w-4" />
              KDA Total / Season
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">{stats.totalKills} / {stats.totalDeaths} / {stats.totalAssists}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Season</p>
                <p className="font-semibold">{stats.seasonKills} / {stats.seasonDeaths} / {stats.seasonAssists}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horas Jogadas
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold text-neon-blue">{stats.totalHours}h</p>
              </div>
              <div>
                <p className="text-muted-foreground">Season</p>
                <p className="font-semibold text-neon-purple">{stats.seasonHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weapons */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm text-muted-foreground mb-3">
            Armas mais utilizadas
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.weapons.map((w) => (
              <Badge
                key={w.name}
                variant="secondary"
                className="border border-border py-1.5 px-2 gap-1"
              >
                <span className="font-medium">{w.name}</span>
                <span className="text-muted-foreground">{w.kills} kills</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map win rates */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Map className="h-4 w-4" />
            Vitórias por mapa
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stats.mapWinRates.map((m) => (
              <div
                key={m.map}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50"
              >
                <span className="font-medium text-sm">{m.map}</span>
                <span
                  className={`text-sm font-semibold ${
                    m.winPct >= 50 ? "text-neon-green" : "text-red-500"
                  }`}
                >
                  {m.winPct}% ({m.wins}V/{m.losses}D)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- LoL Overview ----

function LolOverview({ stats }: { stats: LolStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Target className="h-4 w-4" />}
          label="KDA"
          value={stats.kda}
          accent="text-neon-green"
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Win Rate"
          value={`${stats.winRate}%`}
          accent="text-neon-purple"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Rank Atual"
          value={stats.currentRank}
          accent="text-neon-blue"
          subValue={`${stats.lp} LP`}
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Pico"
          value={stats.peakRank}
          accent="text-neon-pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Swords className="h-4 w-4" />
              KDA Total / Season
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">{stats.totalKills} / {stats.totalDeaths} / {stats.totalAssists}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Season</p>
                <p className="font-semibold">{stats.seasonKills} / {stats.seasonDeaths} / {stats.seasonAssists}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horas Jogadas
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold text-neon-blue">{stats.totalHours}h</p>
              </div>
              <div>
                <p className="text-muted-foreground">Season</p>
                <p className="font-semibold text-neon-purple">{stats.seasonHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm text-muted-foreground mb-3">
            Personagens mais jogados
          </h4>
          <div className="space-y-2">
            {stats.champions.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50"
              >
                <span className="font-medium text-sm">{c.name}</span>
                <span className="text-sm text-muted-foreground">
                  {c.games} jogos · {c.winPct}% WR · {c.kda} KDA
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm text-muted-foreground mb-3">
            Roles mais jogadas
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.roles.map((r) => (
              <Badge
                key={r.role}
                variant="secondary"
                className="border border-border py-1.5 px-2 gap-1"
              >
                <span className="font-medium">{r.role}</span>
                <span className="text-muted-foreground">
                  {r.games} jogos · {r.winPct}% WR
                </span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Stat card helper ----

function StatCard({
  icon,
  label,
  value,
  accent,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  subValue?: string;
}) {
  return (
    <Card className="bg-card/50 border-border overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className={`text-lg font-bold ${accent}`}>{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Match History ----

function MatchHistory({
  matches,
  gameId,
  expandedMatch,
  onToggleExpand,
  onLoadMore,
  loadingMore,
}: {
  matches: Match[];
  gameId: GameId;
  expandedMatch: string | null;
  onToggleExpand: (id: string | null) => void;
  onLoadMore: () => void;
  loadingMore: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Partidas Recentes</h3>
        <div className="space-y-2">
          {matches.map((match) => (
            <Collapsible
              key={match.id}
              open={expandedMatch === match.id}
              onOpenChange={(open) =>
                onToggleExpand(open ? match.id : null)
              }
            >
              <div
                className={`rounded-lg border transition-colors ${
                  expandedMatch === match.id
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/50 bg-card/30 hover:bg-card/50"
                }`}
              >
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between p-3 text-left">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          match.result === "win"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {match.result === "win" ? "V" : "D"}
                      </div>
                      <div>
                        <div className="font-medium">{match.map}</div>
                        <div className="text-sm text-muted-foreground">
                          {match.kda}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{match.score}</div>
                        <div className="text-xs text-muted-foreground">
                          {match.date} · {match.duration}
                        </div>
                      </div>
                      {expandedMatch === match.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {match.expandedDetails && (
                    <div className="px-3 pb-3 pt-0 border-t border-border/50 mt-0">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 text-sm">
                        {match.expandedDetails.headshotPct != null && (
                          <div>
                            <span className="text-muted-foreground">HS%</span>
                            <p className="font-medium">{match.expandedDetails.headshotPct}%</p>
                          </div>
                        )}
                        {match.expandedDetails.adr != null && (
                          <div>
                            <span className="text-muted-foreground">ADR</span>
                            <p className="font-medium">{match.expandedDetails.adr}</p>
                          </div>
                        )}
                        {match.expandedDetails.acs != null && (
                          <div>
                            <span className="text-muted-foreground">ACS</span>
                            <p className="font-medium">{match.expandedDetails.acs}</p>
                          </div>
                        )}
                        {match.expandedDetails.firstBloods != null && (
                          <div>
                            <span className="text-muted-foreground">First Blood</span>
                            <p className="font-medium">{match.expandedDetails.firstBloods}</p>
                          </div>
                        )}
                        {match.expandedDetails.mvps != null && (
                          <div>
                            <span className="text-muted-foreground">MVPs</span>
                            <p className="font-medium">{match.expandedDetails.mvps}</p>
                          </div>
                        )}
                        {match.expandedDetails.damage != null && (
                          <div>
                            <span className="text-muted-foreground">Dano</span>
                            <p className="font-medium">{match.expandedDetails.damage?.toLocaleString()}</p>
                          </div>
                        )}
                        {match.expandedDetails.cs != null && (
                          <div>
                            <span className="text-muted-foreground">CS</span>
                            <p className="font-medium">{match.expandedDetails.cs}</p>
                          </div>
                        )}
                        {match.expandedDetails.vision != null && (
                          <div>
                            <span className="text-muted-foreground">Visão</span>
                            <p className="font-medium">{match.expandedDetails.vision}</p>
                          </div>
                        )}
                        {match.expandedDetails.gold != null && (
                          <div>
                            <span className="text-muted-foreground">Ouro</span>
                            <p className="font-medium">{match.expandedDetails.gold?.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
        <Button
          variant="outline"
          className="w-full mt-4 border-border"
          onClick={onLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Carregar mais
        </Button>
      </CardContent>
    </Card>
  );
}
