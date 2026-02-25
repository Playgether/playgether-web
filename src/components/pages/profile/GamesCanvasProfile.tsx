"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  BarChart3,
  Calendar,
  Clock,
  Edit,
  Eye,
  FileText,
  Gamepad2,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  MoreVertical,
  Plus,
  Settings,
  Share2,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  User,
  UserPlus,
} from "lucide-react";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";

const tabsData = [
  { id: "bio", label: "Bio", icon: User },
  { id: "media", label: "Mídias", icon: ImageIcon },
  { id: "posts", label: "Textos", icon: FileText },
  { id: "game-stats", label: "Estatísticas", icon: TrendingUp },
  { id: "milestones", label: "Marcos", icon: Target },
  { id: "achievements", label: "Conquistas", icon: Trophy },
  { id: "games", label: "Biblioteca", icon: Gamepad2 },
];

const mockPosts = [
  {
    id: 1,
    title: "Finalmente Diamond no Valorant!",
    content:
      "Depois de meses treinando mira e crosshair placement, consegui subir para Diamond. O grind valeu a pena!",
    date: "2 horas atrás",
    likes: 42,
    comments: 8,
  },
  {
    id: 2,
    title: "Setup atualizado",
    content:
      "Acabei de montar meu novo setup com RTX 4080 e monitor 240Hz. A diferença é absurda!",
    date: "1 dia atrás",
    likes: 156,
    comments: 23,
  },
];

const mockMedia = [
  {
    id: 1,
    type: "image",
    thumbnail:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300",
    title: "Ace no Valorant",
    likes: 45,
    comments: 12,
    time: "há 2 horas",
  },
  {
    id: 2,
    type: "video",
    thumbnail:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300",
    title: "Clutch 1v5",
    likes: 89,
    comments: 23,
    time: "há 1 dia",
  },
  {
    id: 3,
    type: "image",
    thumbnail:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300",
    title: "Setup atualizado",
    likes: 156,
    comments: 34,
    time: "há 3 dias",
  },
  {
    id: 4,
    type: "image",
    thumbnail:
      "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=300",
    title: "Tournament Win",
    likes: 203,
    comments: 56,
    time: "há 1 semana",
  },
];

const initialComments = [
  {
    id: 1,
    author: "GamerPro123",
    avatar: "GP",
    content: "Cara, você é muito skilled! Parabéns pelo rank!",
    time: "há 2 horas",
    edited: false,
  },
  {
    id: 2,
    author: "NoobSlayer",
    avatar: "NS",
    content: "Ensina aí como melhorar a mira no Valorant!",
    time: "há 5 horas",
    edited: false,
  },
  {
    id: 3,
    author: "StreamerTop",
    avatar: "ST",
    content: "Quando vai fazer live? Adoraria assistir!",
    time: "há 1 dia",
    edited: false,
  },
  {
    id: 4,
    author: "MasterGG",
    avatar: "MG",
    content: "Suas plays são insanas, continue assim!",
    time: "há 2 dias",
    edited: false,
  },
];

const initialMilestones = [
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

const achievements = [
  {
    id: 1,
    title: "Primeiro Ace",
    description: "Conseguiu um ace pela primeira vez",
    rarity: "common",
    icon: "🎯",
    game: "Valorant",
    date: "15 Mar 2023, 14:30",
    percentage: 45,
  },
  {
    id: 2,
    title: "Streamer Iniciante",
    description: "Fez sua primeira stream",
    rarity: "rare",
    icon: "📺",
    game: "Twitch",
    date: "12 Mai 2022, 20:00",
    percentage: 12,
  },
  {
    id: 3,
    title: "Rank Master",
    description: "Chegou ao rank Diamond",
    rarity: "epic",
    icon: "💎",
    game: "Valorant",
    date: "23 Ago 2023, 22:15",
    percentage: 3,
  },
  {
    id: 4,
    title: "Lenda Viva",
    description: "1000 horas de jogo",
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
];

const games = [
  { id: "valorant", name: "Valorant", image: "/games/Valorant.png" },
  { id: "lol", name: "League of Legends", image: "/games/League of Legends.png" },
  { id: "csgo", name: "CS:GO", image: "/games/Counter Strike 2.png" },
];

function getRarityColor(rarity: string) {
  switch (rarity) {
    case "common":
      return "bg-gray-500";
    case "rare":
      return "bg-blue-500";
    case "epic":
      return "bg-purple-500";
    case "legendary":
      return "bg-gradient-secondary";
    default:
      return "bg-gray-500";
  }
}

function getRarityHoverColor(rarity: string) {
  switch (rarity) {
    case "common":
      return "hover:shadow-[0_0_20px_rgba(156,163,175,0.3)]";
    case "rare":
      return "hover:shadow-[0_0_20px_rgba(96,165,250,0.3)]";
    case "epic":
      return "hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]";
    case "legendary":
      return "hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]";
    default:
      return "hover:shadow-[0_0_20px_rgba(156,163,175,0.3)]";
  }
}

function AddCommentModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Comentário</DialogTitle>
          <DialogDescription>Escreva um comentário para o perfil.</DialogDescription>
        </DialogHeader>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Seu comentário..."
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSubmit(value);
              setValue("");
              onClose();
            }}
          >
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditCommentModal({
  isOpen,
  onClose,
  onSubmit,
  initialComment,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newContent: string) => void;
  initialComment: string;
}) {
  const [value, setValue] = useState(initialComment);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Comentário</DialogTitle>
          <DialogDescription>Atualize o conteúdo do comentário.</DialogDescription>
        </DialogHeader>
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSubmit(value);
              onClose();
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  destructive,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  destructive?: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="rounded-lg overflow-hidden border border-border">
          <img src={imageUrl} alt={title} className="w-full h-auto" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MilestoneModal({
  isOpen,
  onClose,
  onSubmit,
  milestone,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (milestone: any) => void;
  milestone: any;
  mode: "add" | "edit";
}) {
  const [title, setTitle] = useState(milestone?.title || "");
  const [description, setDescription] = useState(milestone?.description || "");
  const [date, setDate] = useState(milestone?.date || "");
  const [image, setImage] = useState(milestone?.image || "");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Adicionar Marco" : "Editar Marco"}</DialogTitle>
          <DialogDescription>Preencha as informações do marco.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição"
          />
          <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Data" />
          <Input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="URL da imagem (opcional)"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSubmit({ title, description, date, image: image || null });
              onClose();
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AchievementModal({
  isOpen,
  onClose,
  achievement,
}: {
  isOpen: boolean;
  onClose: () => void;
  achievement: any;
}) {
  if (!achievement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{achievement.icon}</span>
            {achievement.title}
          </DialogTitle>
          <DialogDescription>{achievement.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Raridade</span>
            <Badge
              variant="outline"
              className={`${getRarityColor(achievement.rarity)} text-white border-0 text-xs`}
            >
              {achievement.rarity}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Jogo</span>
            <span className="font-medium">{achievement.game}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Conquistado em</span>
            <span className="font-medium">{achievement.date}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">% dos jogadores</span>
            <span className="font-medium">{achievement.percentage}%</span>
          </div>

          {achievement.progression ? (
            <div className="pt-2 border-t border-border">
              <div className="text-sm font-medium mb-2">Caminho da Conquista</div>
              <div className="flex flex-wrap gap-2">
                {achievement.progression.path.map((p: number) => (
                  <Badge
                    key={p}
                    variant="outline"
                    className={
                      p <= achievement.progression.current
                        ? "bg-gradient-primary text-white border-0"
                        : "border-border"
                    }
                  >
                    {p}h
                  </Badge>
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Próxima: {achievement.progression.next}h
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GamesCanvasUserProfile({ profile }: { profile: getProfileByUsernameProps | null }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(profile?.quantity_likes ?? 234);
  const userRating = 4.6;

  const followersCount =
    (profile?.followed_by && Array.isArray(profile.followed_by)
      ? profile.followed_by.length
      : 0) ?? 0;
  const followingCount =
    (profile?.follows && Array.isArray(profile.follows) ? profile.follows.length : 0) ??
    0;

  const userStats = useMemo(
    () => [
      { label: "Seguidores", value: followersCount.toLocaleString(), color: "text-neon-blue" },
      { label: "Seguindo", value: followingCount.toLocaleString(), color: "text-neon-purple" },
      {
        label: "Posts",
        value: (profile?.quantity_comment ?? 0).toLocaleString(),
        color: "text-neon-green",
      },
      {
        label: "Nível",
        value: (profile?.gamer_nivel ?? 0).toLocaleString(),
        color: "text-neon-pink",
      },
    ],
    [followersCount, followingCount, profile?.quantity_comment, profile?.gamer_nivel]
  );

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (rating <= 3.5) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-green-500 bg-green-500/10 border-green-500/20";
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div className="w-full max-w-sm">
      <Card className="overflow-hidden bg-card border-border shadow-card">
        <div className="relative h-32 overflow-hidden">
          <img
            src={"/profile/profile1.jpg"}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-primary opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-0">
          <div className="relative px-6 pb-6">
            <div className="absolute -top-10 left-6">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-card shadow-neon">
                  <AvatarImage
                    src={profile?.profile_photo || "/profile/perfil.jpg"}
                    alt={profile?.name || "Profile"}
                  />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {(profile?.name || "PG")
                      .split(" ")
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-green rounded-full border-2 border-card" />
              </div>
            </div>

            <div className="pt-12 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold text-card-foreground">
                    {profile?.name || "—"}
                  </h1>
                  <Badge
                    variant="secondary"
                    className={`border-0 font-semibold ${getRatingColor(userRating)}`}
                  >
                    {userRating}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  @{(profile?.name || "user").toLowerCase().replace(/\s+/g, "")}
                </p>
                <p className="text-sm text-card-foreground leading-relaxed">
                  {profile?.bio ||
                    "Gamer profissional especializado em FPS e MOBA. Streamer nas horas vagas 🎮✨"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 py-4">
                {userStats.map((stat, index) => (
                  <div key={index} className="text-center space-y-1">
                    <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant={isFollowing ? "secondary" : "default"}
                    size="sm"
                    className={`flex-1 ${
                      isFollowing
                        ? "bg-secondary hover:bg-secondary/80"
                        : "bg-gradient-primary hover:shadow-neon transition-all duration-200 border-0"
                    }`}
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isFollowing ? "Seguindo" : "Seguir"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className={`${
                      isLiked
                        ? "text-red-500 border-red-500/30 bg-red-500/10"
                        : "border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                    } transition-all duration-200`}
                    onClick={handleLike}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                    <span className="ml-1 text-xs">{likes}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="border-border hover:shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-200"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-muted/20 px-6 py-3">
            <div className="flex justify-between text-center">
              <div className="flex-1">
                <div className="text-sm font-semibold text-neon-blue">
                  {profile?.performance || "85%"}
                </div>
                <div className="text-xs text-muted-foreground">Taxa Vitória</div>
              </div>
              <div className="flex-1 border-x border-border/50">
                <div className="text-sm font-semibold text-neon-purple">
                  {(profile?.matches_played ?? 1247).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Partidas</div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-neon-green">Diamond</div>
                <div className="text-xs text-muted-foreground">Rank Atual</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GamesCanvasContentTabs({ profile }: { profile: getProfileByUsernameProps | null }) {
  const [activeTab, setActiveTab] = useState("bio");
  const [selectedGame, setSelectedGame] = useState("");
  const [statsTab, setStatsTab] = useState("overview");
  const [comments, setComments] = useState(initialComments);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: "", title: "" });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; data: any } | null>(
    null
  );
  const [editingComment, setEditingComment] = useState<any>(null);
  const [isEditCommentModalOpen, setIsEditCommentModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [milestoneModalMode, setMilestoneModalMode] = useState<"add" | "edit">("add");
  const [userHasCommented, setUserHasCommented] = useState(false);
  const [isAddCommentModalOpen, setIsAddCommentModalOpen] = useState(false);

  const handleAddComment = (comment: string) => {
    if (!userHasCommented) {
      const newComment = {
        id: Date.now(),
        author: "Você",
        avatar: "EU",
        content: comment,
        time: "agora",
        edited: false,
      };
      setComments((prev) => [newComment, ...prev]);
      setUserHasCommented(true);
    }
  };

  const handleEditComment = (commentId: number, newContent: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, content: newContent, edited: true } : comment
      )
    );
  };

  const handleDeleteComment = (commentId: number) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    if (comments.find((c) => c.id === commentId)?.author === "Você") {
      setUserHasCommented(false);
    }
  };

  const handleAddMilestone = (milestone: any) => {
    const newMilestone = {
      id: Date.now(),
      ...milestone,
    };
    setMilestones((prev) => [newMilestone, ...prev]);
  };

  const handleEditMilestone = (milestoneId: number, updatedMilestone: any) => {
    setMilestones((prev) =>
      prev.map((milestone) =>
        milestone.id === milestoneId ? { ...milestone, ...updatedMilestone } : milestone
      )
    );
  };

  const handleDeleteMilestone = (milestoneId: number) => {
    setMilestones((prev) => prev.filter((milestone) => milestone.id !== milestoneId));
  };

  const openConfirmModal = (type: string, data: any) => {
    setConfirmAction({ type, data });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case "deleteComment":
        handleDeleteComment(confirmAction.data.id);
        break;
      case "deleteMilestone":
        handleDeleteMilestone(confirmAction.data.id);
        break;
      case "addComment":
        handleAddComment(confirmAction.data.comment);
        break;
      case "addMilestone":
        handleAddMilestone(confirmAction.data.milestone);
        break;
    }
    setConfirmAction(null);
  };

  return (
    <div className="flex-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap justify-center lg:justify-start gap-1 bg-card border border-border p-1 mb-6 h-auto overflow-visible">
          {tabsData.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col items-center gap-1 p-3 min-w-[80px] h-auto data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-neon transition-all duration-200"
            >
              <tab.icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs whitespace-nowrap">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="bg-card rounded-lg border border-border shadow-card">
          <TabsContent value="bio" className="p-6 space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sobre mim</h3>
              <p className="text-muted-foreground leading-relaxed">
                {profile?.bio ||
                  "Gamer apaixonado por FPS e MOBA com mais de 5 anos de experiência competitiva. Especialista em Valorant e League of Legends, atualmente no rank Diamond em ambos os jogos."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <span className="text-neon-blue">🎮</span>
                    Jogos Principais
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gradient-primary/10 rounded-lg border border-primary/20">
                      <img
                        src={games[0].image}
                        alt="Valorant"
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div>
                        <div className="font-medium text-card-foreground">Valorant</div>
                        <div className="text-sm text-muted-foreground">Rank: Diamond 2</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-secondary/10 rounded-lg border border-secondary/20">
                      <img
                        src={games[1].image}
                        alt="League of Legends"
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div>
                        <div className="font-medium text-card-foreground">
                          League of Legends
                        </div>
                        <div className="text-sm text-muted-foreground">Rank: Platinum 1</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-primary/10 rounded-lg border border-primary/20">
                      <img
                        src={games[2].image}
                        alt="CS:GO"
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div>
                        <div className="font-medium text-card-foreground">CS:GO</div>
                        <div className="text-sm text-muted-foreground">Rank: Global Elite</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <span className="text-neon-green">📊</span>
                    Estatísticas Rápidas
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
                      <span className="text-muted-foreground">Tempo de jogo</span>
                      <span className="font-semibold text-neon-blue">
                        {(profile?.hours_played ?? 2340).toLocaleString()}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
                      <span className="text-muted-foreground">Primeira partida</span>
                      <span className="font-semibold text-neon-purple">Jan 2019</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
                      <span className="text-muted-foreground">Streamer desde</span>
                      <span className="font-semibold text-neon-pink">Mai 2022</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-neon-blue" />
                  Comentários
                </h4>
                <div className="space-y-4">
                  {!userHasCommented && (
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        className="hover:shadow-card transition-shadow duration-200"
                        onClick={() => setIsAddCommentModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Comentário
                      </Button>
                    </div>
                  )}
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-3 p-4 bg-card/30 rounded-lg border border-border/50"
                    >
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {comment.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">{comment.time}</span>
                          {comment.edited && (
                            <span className="text-xs text-muted-foreground">(editado)</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                      {comment.author === "Você" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingComment(comment);
                                setIsEditCommentModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              onClick={() => openConfirmModal("deleteComment", comment)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="game-stats" className="p-6">
            <div className="space-y-6">
              {!selectedGame ? (
                <div className="text-center space-y-6">
                  <h2 className="text-2xl font-bold text-card-foreground">
                    Escolha um jogo para ver as estatísticas
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    {games.map((game) => (
                      <Card
                        key={game.id}
                        className="cursor-pointer hover:shadow-card transition-all duration-200 group"
                        onClick={() => setSelectedGame(game.id)}
                      >
                        <CardContent className="p-6 text-center space-y-4">
                          <img
                            src={game.image}
                            alt={game.name}
                            className="w-16 h-16 mx-auto rounded-lg group-hover:scale-105 transition-transform duration-200"
                          />
                          <h3 className="font-semibold text-lg">{game.name}</h3>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGame("")}
                      className="hover:shadow-card transition-shadow duration-200"
                    >
                      ← Voltar
                    </Button>
                    <h2 className="text-xl font-bold text-card-foreground">
                      Estatísticas -{" "}
                      {selectedGame === "valorant"
                        ? "Valorant"
                        : selectedGame === "lol"
                          ? "League of Legends"
                          : "CS:GO"}
                    </h2>
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
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center space-y-4">
                          <div className="text-6xl">🚧</div>
                          <h3 className="text-2xl font-bold text-card-foreground">
                            Em breve
                          </h3>
                          <p className="text-muted-foreground">
                            As estatísticas detalhadas serão implementadas em breve.
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="matches" className="space-y-4 mt-6">
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-4">Partidas Recentes</h3>
                          <div className="space-y-3">
                            {[
                              { map: "Ascent", result: "V", score: "13-7", kda: "18/12/6", date: "2h atrás" },
                              { map: "Bind", result: "D", score: "11-13", kda: "15/14/4", date: "1d atrás" },
                            ].map((match, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/50"
                              >
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      match.result === "V"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-red-500/20 text-red-400"
                                    }`}
                                  >
                                    {match.result}
                                  </div>
                                  <div>
                                    <div className="font-medium">{match.map}</div>
                                    <div className="text-sm text-muted-foreground">{match.kda}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{match.score}</div>
                                  <div className="text-xs text-muted-foreground">{match.date}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="media" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockMedia.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden group cursor-pointer hover:shadow-card transition-all duration-200"
                >
                  <div className="relative">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-4 border-l-black border-y-2 border-y-transparent ml-1" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-xs text-white">
                      {item.time}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3 truncate">{item.title}</h4>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Heart className="h-4 w-4" />
                          <span>{item.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          <span>{item.comments}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="p-6 space-y-4">
            {mockPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-card transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold">{post.title}</h4>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.date}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="achievements" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`relative overflow-hidden cursor-pointer transition-all duration-200 ${getRarityHoverColor(
                    achievement.rarity
                  )}`}
                  onClick={() => {
                    setSelectedAchievement(achievement);
                    setIsAchievementModalOpen(true);
                  }}
                >
                  <div
                    className={`absolute top-0 right-0 w-16 h-16 ${getRarityColor(
                      achievement.rarity
                    )} opacity-10 transform rotate-45 translate-x-4 -translate-y-4`}
                  />
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <Badge
                            variant="outline"
                            className={`${getRarityColor(
                              achievement.rarity
                            )} text-white border-0 text-xs`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Marcos Pessoais</h3>
                <Button
                  className="bg-gradient-primary hover:shadow-neon transition-all duration-200"
                  onClick={() => {
                    setMilestoneModalMode("add");
                    setEditingMilestone(null);
                    setIsMilestoneModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Marco
                </Button>
              </div>

              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <Card key={milestone.id} className="hover:shadow-card transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {milestone.image && (
                          <div
                            className="w-16 h-16 bg-gradient-primary/10 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-200"
                            onClick={() => {
                              setSelectedImage({ url: milestone.image!, title: milestone.title });
                              setIsImageModalOpen(true);
                            }}
                          >
                            <img
                              src={milestone.image}
                              alt={milestone.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{milestone.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {milestone.date}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingMilestone(milestone);
                                      setMilestoneModalMode("edit");
                                      setIsMilestoneModalOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500 focus:text-red-500"
                                    onClick={() => openConfirmModal("deleteMilestone", milestone)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="games" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-6">Biblioteca de Jogos</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((game) => (
                  <Card key={game.id} className="hover:shadow-card transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={game.image}
                          alt={game.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{game.name}</h4>
                          {game.id === "valorant" ? (
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>✅ Conectado</div>
                              <div>Nick: RayJunior#BR1</div>
                              <div>ID: #BR1-2023</div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">❌ Não conectado</div>
                          )}
                        </div>
                      </div>

                      {game.id === "valorant" ? (
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="p-2 bg-card/50 rounded">
                            <div className="font-semibold text-neon-blue">Diamond 2</div>
                            <div className="text-xs text-muted-foreground">Rank Atual</div>
                          </div>
                          <div className="p-2 bg-card/50 rounded">
                            <div className="font-semibold text-neon-green">1,247</div>
                            <div className="text-xs text-muted-foreground">RR</div>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full hover:bg-gradient-primary hover:text-white hover:border-transparent transition-all duration-200"
                        >
                          Conectar Conta
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <AchievementModal
        isOpen={isAchievementModalOpen}
        onClose={() => setIsAchievementModalOpen(false)}
        achievement={selectedAchievement}
      />

      <MilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        onSubmit={(milestone) => {
          if (milestoneModalMode === "add") {
            openConfirmModal("addMilestone", { milestone });
          } else {
            handleEditMilestone(editingMilestone!.id, milestone);
          }
        }}
        milestone={editingMilestone}
        mode={milestoneModalMode}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImage.url}
        title={selectedImage.title}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          confirmAction?.type === "deleteComment"
            ? "Excluir Comentário"
            : confirmAction?.type === "deleteMilestone"
              ? "Excluir Marco"
              : confirmAction?.type === "addComment"
                ? "Adicionar Comentário"
                : confirmAction?.type === "addMilestone"
                  ? "Adicionar Marco"
                  : ""
        }
        description={
          confirmAction?.type === "deleteComment"
            ? "Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita."
            : confirmAction?.type === "deleteMilestone"
              ? "Tem certeza que deseja excluir este marco? Esta ação não pode ser desfeita."
              : confirmAction?.type === "addComment"
                ? "Tem certeza que deseja adicionar este comentário?"
                : confirmAction?.type === "addMilestone"
                  ? "Tem certeza que deseja adicionar este marco?"
                  : ""
        }
        confirmText={confirmAction?.type?.includes("delete") ? "Excluir" : "Adicionar"}
        destructive={confirmAction?.type?.includes("delete")}
      />

      <EditCommentModal
        isOpen={isEditCommentModalOpen}
        onClose={() => setIsEditCommentModalOpen(false)}
        onSubmit={(newContent) => handleEditComment(editingComment.id, newContent)}
        initialComment={editingComment?.content || ""}
      />

      <AddCommentModal
        isOpen={isAddCommentModalOpen}
        onClose={() => setIsAddCommentModalOpen(false)}
        onSubmit={(comment) => openConfirmModal("addComment", { comment })}
      />
    </div>
  );
}

export default function GamesCanvasProfile({
  profile,
}: {
  profile: getProfileByUsernameProps | null;
}) {
  return (
    <div className="min-h-screen bg-background mb-[120px] pt-16 ml-0 md:ml-20">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 order-1 lg:order-1">
            <div className="sticky top-6">
              <GamesCanvasUserProfile profile={profile} />
            </div>
          </div>

          <div className="lg:col-span-3 order-2 lg:order-2">
            <GamesCanvasContentTabs profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}

