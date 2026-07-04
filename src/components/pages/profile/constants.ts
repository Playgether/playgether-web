import {
  FileText,
  Gamepad2,
  Image as ImageIcon,
  Target,
  Trophy,
  TrendingUp,
  User,
} from "lucide-react";

export const tabsData = [
  { id: "bio", label: "Bio", shortLabel: "Bio", icon: User },
  { id: "media", label: "Mídias", shortLabel: "Mídia", icon: ImageIcon },
  { id: "posts", label: "Textos", shortLabel: "Textos", icon: FileText },
  { id: "game-stats", label: "Estatísticas", shortLabel: "Stats", icon: TrendingUp },
  { id: "milestones", label: "Marcos", shortLabel: "Marcos", icon: Target },
  { id: "achievements", label: "Conquistas", shortLabel: "Conq.", icon: Trophy },
  { id: "games", label: "Biblioteca", shortLabel: "Jogos", icon: Gamepad2 },
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

export const games = [
  { id: "valorant", name: "Valorant", image: "/games/Valorant.png" },
  {
    id: "lol",
    name: "League of Legends",
    image: "/games/League of Legends.png",
  },
  { id: "csgo", name: "CS2", image: "/games/Counter Strike 2.png" },
];
