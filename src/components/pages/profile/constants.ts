import {
  FileText,
  Gamepad2,
  Image as ImageIcon,
  Target,
  Trophy,
  TrendingUp,
  User,
} from "lucide-react";
import type { RarityLevel } from "./rarityConfig";

export const tabsData = [
  { id: "bio", label: "Bio", icon: User },
  { id: "media", label: "Mídias", icon: ImageIcon },
  { id: "posts", label: "Textos", icon: FileText },
  { id: "game-stats", label: "Estatísticas", icon: TrendingUp },
  { id: "milestones", label: "Marcos", icon: Target },
  { id: "achievements", label: "Conquistas", icon: Trophy },
  { id: "games", label: "Biblioteca", icon: Gamepad2 },
];

export const initialMilestones = [
  {
    id: 1,
    title: "Primeiro PC Gamer",
    description: "O dia que montei meu primeiro setup gamer completo!",
    date: "15 Jan 2019",
    image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=300",
  },
  {
    id: 2,
    title: "Rank Diamond",
    description: "Finalmente consegui chegar no Diamond no Valorant!",
    date: "23 Ago 2023",
    image: null,
  },
  {
    id: 3,
    title: "Primeira Stream",
    description: "Dia histórico - minha primeira live na Twitch!",
    date: "12 Mai 2022",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300",
  },
];

export const achievements: Array<{
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
}> = [
  {
    id: 1,
    title: "Primeiro Ace",
    description: "Conseguiu um ace pela primeira vez em partida competitiva.",
    rarity: "common",
    icon: "🎯",
    game: "Valorant",
    date: "15 Mar 2023, 14:30",
    percentage: 45,
  },
  {
    id: 2,
    title: "Primeiros Passos",
    description: "Completou o tutorial e criou seu perfil na plataforma.",
    rarity: "medium",
    icon: "👣",
    game: "Playgether",
    date: "10 Jan 2022, 10:00",
    percentage: 60,
  },
  {
    id: 3,
    title: "Streamer Iniciante",
    description: "Fez sua primeira stream e acumulou 500 views.",
    rarity: "rare",
    icon: "📺",
    game: "Twitch",
    date: "12 Mai 2022, 20:00",
    percentage: 12,
  },
  {
    id: 4,
    title: "Sniper de Elite",
    description: "Acertou 100 headshots consecutivos sem morrer.",
    rarity: "ultra-rare",
    icon: "🎯",
    game: "CS:GO",
    date: "08 Jul 2022, 22:45",
    percentage: 4,
  },
  {
    id: 5,
    title: "Rank Master",
    description: "Chegou ao rank Diamond pela primeira vez.",
    rarity: "epic",
    icon: "💎",
    game: "Valorant",
    date: "23 Ago 2023, 22:15",
    percentage: 3,
  },
  {
    id: 6,
    title: "Força da Natureza",
    description:
      "Completou 72h de maratona sem nenhuma derrota no ranking global.",
    rarity: "mythic",
    icon: "🔥",
    game: "Steam",
    date: "31 Out 2023, 06:00",
    percentage: 0.8,
  },
  {
    id: 7,
    title: "Lenda Viva",
    description: "1000 horas de jogo acumuladas. Reconhecido pela comunidade.",
    rarity: "legendary",
    icon: "👑",
    game: "Steam",
    date: "01 Dez 2023, 18:45",
    percentage: 0.5,
    progression: {
      current: 1000,
      next: 1500,
      path: [10, 50, 100, 300, 500, 1000, 1500, 2000, 3000, 5000],
    },
  },
  {
    id: 8,
    title: "Além das Estrelas",
    description:
      "Atingiu o topo do ranking global em 3 jogos diferentes simultaneamente.",
    rarity: "celestial",
    icon: "🌌",
    game: "Playgether",
    date: "15 Fev 2024, 00:00",
    percentage: 0.01,
    recentlyUnlocked: true,
  },
];

export const games = [
  { id: "valorant", name: "Valorant", image: "/games/Valorant.png" },
  {
    id: "lol",
    name: "League of Legends",
    image: "/games/League of Legends.png",
  },
  { id: "csgo", name: "CS:GO", image: "/games/Counter Strike 2.png" },
];
