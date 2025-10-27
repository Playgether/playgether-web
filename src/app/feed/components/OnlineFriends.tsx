"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Import avatars
import avatarMia from "@/assets/avatar-mia.jpg";
import avatarSophia from "@/assets/avatar-sophia.jpg";
import avatarAline from "@/assets/avatar-aline.jpg";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "away" | "offline";
  game?: string;
}

const friends: Friend[] = [
  {
    id: "1",
    name: "Mia Jensen",
    avatar: avatarMia,
    status: "online",
    game: "Apex Legends",
  },
  { id: "2", name: "Mustabellin Kru", avatar: avatarSophia, status: "away" },
  {
    id: "3",
    name: "João Silva",
    avatar: avatarAline,
    status: "online",
    game: "CS2",
  },
  { id: "4", name: "Ana Costa", avatar: avatarMia, status: "offline" },
  {
    id: "5",
    name: "Pedro Lima",
    avatar: avatarSophia,
    status: "online",
    game: "Valorant",
  },
  {
    id: "6",
    name: "Maria Santos",
    avatar: avatarAline,
    status: "online",
    game: "Fortnite",
  },
  { id: "7", name: "Carlos Oliveira", avatar: avatarMia, status: "away" },
  {
    id: "8",
    name: "Fernanda Costa",
    avatar: avatarSophia,
    status: "online",
    game: "League of Legends",
  },
];

const getStatusLabel = (status: Friend["status"]) => {
  switch (status) {
    case "online":
      return "Online";
    case "away":
      return "Ausente";
    case "offline":
      return "Offline";
  }
};

const getStatusClass = (status: Friend["status"]) => {
  switch (status) {
    case "online":
      return "status-online";
    case "away":
      return "status-away";
    case "offline":
      return "status-offline";
  }
};

export const OnlineFriends = () => {
  const [showAll, setShowAll] = useState(false);

  const displayedFriends = showAll ? friends : friends.slice(0, 5);
  return (
    <Card className="bg-card border-border/50 backdrop-blur-sm animate-fade-up hover:shadow-glow-primary/30 hover:scale-[1.02] hover:border-primary/40 ">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold">Amigos online</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar"
            className="pl-10 bg-muted/50 border-border/50 focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {displayedFriends.map((friend, index) => (
          <div
            key={friend.id}
            className="flex items-center space-x-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 hover:shadow-improved transition-all duration-200 cursor-pointer group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={friend.avatar} alt={friend.name} />
                <AvatarFallback className="bg-gradient-primary text-white text-sm">
                  {friend.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                  getStatusClass(friend.status)
                )}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                {friend.name}
              </p>
              {friend.game ? (
                <p className="text-xs text-neon-green font-medium">
                  Jogando {friend.game}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {getStatusLabel(friend.status)}
                </p>
              )}
            </div>
          </div>
        ))}

        <div className="pt-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {showAll ? "Mostrar Menos" : "Ver Todos"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
