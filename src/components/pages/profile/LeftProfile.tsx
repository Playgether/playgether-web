import Image from "next/legacy/image";
import { MdVerified } from "react-icons/md";
import { getProfileByUsernameProps } from "@/services/getProfileByUsername";

export const LeftProfile = ({
  profile,
}: {
  profile: getProfileByUsernameProps | null;
}) => {
  const followersCount =
    (profile?.followed_by && Array.isArray(profile.followed_by)
      ? profile.followed_by.length
      : 0) ?? 0;
  const followingCount =
    (profile?.follows && Array.isArray(profile.follows) ? profile.follows.length : 0) ??
    0;

  return (
    <div className="w-full">
      <div className="overflow-hidden bg-card border border-border/50 shadow-card rounded-2xl">
        <div className="relative h-32 overflow-hidden">
          <Image
            src={"/profile/profile1.jpg"}
            layout="fill"
            objectFit="cover"
            width={0}
            height={0}
            alt={"Profile banner"}
          />
          <div className="absolute inset-0 bg-gradient-primary opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>

        <div className="relative px-6 pb-6">
          <div className="absolute -top-10 left-6">
            <div className="relative">
              <div className="relative w-20 h-20 rounded-full border-4 border-card shadow-neon overflow-hidden">
                <Image
                  src={profile?.profile_photo || "/profile/perfil.jpg"}
                  layout="fill"
                  objectFit="cover"
                  width={0}
                  height={0}
                  alt={"Profile avatar"}
                />
              </div>

              {profile?.verified ? (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 status-online rounded-full border-2 border-card" />
              ) : null}
            </div>
          </div>

          <div className="pt-12 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-xl font-bold text-card-foreground truncate">
                    {profile?.name}
                  </h1>
                  {profile?.verified ? (
                    <MdVerified className="text-neon-blue flex-shrink-0" />
                  ) : null}
                </div>

                <div className="border border-border/50 bg-muted/40 px-3 py-1 rounded-full text-sm font-semibold text-card-foreground">
                  4.6
                </div>
              </div>

              {profile?.bio ? (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {profile.bio}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3 py-4">
              <div className="text-center space-y-1">
                <div className="text-lg font-bold text-neon-blue">
                  {followersCount.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Seguidores
                </div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-lg font-bold text-neon-purple">
                  {followingCount.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Seguindo
                </div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-lg font-bold text-neon-green">
                  {(profile?.quantity_likes ?? 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Curtidas
                </div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-lg font-bold text-neon-pink">
                  {(profile?.gamer_nivel ?? 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Nível
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="DefaultButton-wrapper flex-1 h-9 rounded-md border-0 bg-gradient-primary text-white font-medium hover:shadow-neon transition-all duration-200"
              >
                Seguir
              </button>
              <button
                type="button"
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/40 hover:bg-muted/60 hover:shadow-glow transition-all duration-200"
                aria-label="Curtir"
                title="Curtir"
              >
                ♥
              </button>
              <button
                type="button"
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/40 hover:bg-muted/60 hover:shadow-glow transition-all duration-200"
                aria-label="Compartilhar"
                title="Compartilhar"
              >
                ↗
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 bg-muted/20 px-6 py-3">
          <div className="flex justify-between text-center">
            <div className="flex-1">
              <div className="text-sm font-semibold text-neon-blue">
                {(profile?.hours_played ?? 0).toLocaleString()}h
              </div>
              <div className="text-xs text-muted-foreground">Horas jogadas</div>
            </div>
            <div className="flex-1 border-x border-border/30">
              <div className="text-sm font-semibold text-neon-purple">
                {(profile?.matches_played ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Partidas</div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-neon-green">
                {profile?.performance || "—"}
              </div>
              <div className="text-xs text-muted-foreground">Performance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
