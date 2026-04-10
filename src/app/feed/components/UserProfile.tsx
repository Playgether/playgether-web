import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageSquare, Image } from "lucide-react";
import type { StaticImageData } from "next/image";
import { PresenceStatusDot } from "@/components/presence/PresenceStatusDot";

interface UserProfileProps {
  user: {
    name: string;
    username: string;
    bio: string;
    avatar: string | StaticImageData;
    followers: number;
    following: number;
    posts: number;
  };
  /** Quando definido, exibe bolinha de presença (ex.: usuário logado). */
  userId?: number;
  /** Card do próprio usuário: bolinha abre o seletor de status. */
  allowStatusPicker?: boolean;
}

export const UserProfile = ({
  user,
  userId,
  allowStatusPicker = false,
}: UserProfileProps) => {
  return (
    <Card className="bg-card border-border/50 backdrop-blur-sm hover:shadow-glow-primary/30 hover:scale-[1.02] hover:border-primary/40 transition-all duration-300 animate-fade-up">
      <CardContent className="p-6 text-center">
        {/* Avatar centralizado */}
        <div className="flex justify-center mb-4">
          <div className="relative inline-block">
            <Avatar className="w-20 h-20 ring-4 ring-primary/30">
              <AvatarImage src={typeof user.avatar === 'string' ? user.avatar : user.avatar.src} alt={user.name} />
              <AvatarFallback className="bg-gradient-primary text-white font-bold text-xl">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {userId != null ? (
              <PresenceStatusDot
                userId={userId}
                sizeClass="w-5 h-5"
                allowPicker={allowStatusPicker}
              />
            ) : null}
          </div>
        </div>

        {/* Nome e username centralizados */}
        <h3 className="font-bold text-xl text-foreground mb-1">{user.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">@{user.username}</p>

        {/* Bio centralizada */}
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {user.bio}
        </p>

        {/* Botão centralizado */}
        <Button className="w-full bg-gradient-primary hover:shadow-glow-primary text-white font-medium transition-all duration-300 hover:scale-105 mb-6">
          Ver Perfil
        </Button>

        {/* Stats em linha horizontal */}
        <div className="flex justify-between text-sm border-t border-border/50 pt-4">
          <div className="text-center">
            <div className="font-bold text-lg text-foreground">
              {user.followers > 1000
                ? `${(user.followers / 1000).toFixed(1)}K`
                : user.followers}
            </div>
            <div className="text-xs text-muted-foreground">Seguidores</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-foreground">
              {user.following}
            </div>
            <div className="text-xs text-muted-foreground">Seguindo</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-foreground">
              {user.posts}
            </div>
            <div className="text-xs text-muted-foreground">Posts</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
