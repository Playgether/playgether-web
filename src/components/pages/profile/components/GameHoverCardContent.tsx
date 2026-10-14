"use client";
import { GameMediaImage } from "@/components/media/GameMediaImage";
import type { GameTextIconIdentity } from "@/components/media/GameTextIcon";

type Props = {
  title: string;
  description?: string | null;
  logo?: string | null;
  /** Só pra cards de jogo (LoL/VAL mostram plaquinha de texto); omitir em cards de empresa. */
  game?: GameTextIconIdentity | null;
};

export function GameHoverCardContent({
  title,
  description,
  logo,
  game,
}: Props) {
  const hasLogo = Boolean(logo) || Boolean(game);

  return (
    <div className="max-h-64 overflow-y-auto pr-1 text-left">
      <div className="flex items-start gap-3">
        {hasLogo ? (
          <GameMediaImage
            src={logo}
            alt={`${title} logo`}
            size="icon"
            game={game}
            className="h-12 w-12 shrink-0 rounded-md border border-border bg-card/50"
            spinnerClassName="h-4 w-4"
          />
        ) : null}
        {/* Placeholder do quadradinho de logo removido por enquanto — várias
            empresas/jogos (ex.: Riot Games) ainda não têm logo cadastrada, e
            o quadrado vazio ficava estranho na UI. Reativar aqui quando
            tiver uma logo de fallback de verdade:
        : (
          <div className="h-12 w-12 shrink-0 rounded-md border border-border bg-card/50" />
        )
        */}

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
