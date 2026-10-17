"use client";
import { GameMediaImage } from "@/components/media/GameMediaImage";
import {
  getGameTextIcon,
  type GameTextIconIdentity,
} from "@/components/media/GameTextIcon";

type Props = {
  title: string;
  description?: string | null;
  logo?: string | null;
  /** Card de jogo: passa acronym/name. Card de empresa: omitir — usamos o `title`. */
  game?: GameTextIconIdentity | null;
};

export function GameHoverCardContent({
  title,
  description,
  logo,
  game,
}: Props) {
  // Empresa Riot (e LoL/VAL) caem na plaquinha de texto mesmo sem prop `game`.
  const identity = game ?? { name: title };
  const hasLogo = Boolean(logo) || Boolean(getGameTextIcon(identity));

  return (
    <div className="max-h-64 overflow-y-auto pr-1 text-left">
      <div className="flex items-start gap-3">
        {hasLogo ? (
          <GameMediaImage
            src={logo}
            alt={`${title} logo`}
            size="icon"
            game={identity}
            className="h-12 w-12 shrink-0 rounded-md border border-border bg-card/50"
            spinnerClassName="h-4 w-4"
          />
        ) : null}

        <div className="min-w-0">
          <div className="truncate font-semibold">{title}</div>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
