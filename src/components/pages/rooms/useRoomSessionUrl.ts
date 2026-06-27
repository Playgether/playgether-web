"use client";

import { useRoomEventSession } from "@/context/RoomEventSessionContext";
import type { RoomSessionMode } from "@/lib/roomRoutes";
import {
  parseRoomSessionModeFromPath,
  replaceRoomBrowserPath,
  roomBasePath,
  roomGamePath,
  roomWatchPath,
} from "@/lib/roomRoutes";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const WATCH_AMBIENCE_WAIT_MS = 5000;

function participantInActiveGame(
  participation: ReturnType<typeof useRoomEventSession>["myParticipation"],
  eventStatus: string | undefined,
): boolean {
  if (!participation?.participation_confirmed) return false;
  if (participation.invitation_declined || participation.left_early) return false;
  return eventStatus === "running" || eventStatus === "finished";
}

type UseRoomSessionUrlArgs = {
  roomSlug: string;
  initialMode?: RoomSessionMode;
  roomAmbienceActive: boolean;
  ambienceEntered: boolean;
  immersionAmbience: boolean;
  /** Evento cujos resultados o usuário já fechou — não exibir bloqueio de acesso ao sair do jogo. */
  resultsDismissedForEventId?: number | null;
  onApplyWatchDeepLink: () => void;
  onGameDeepLinkDenied?: () => void;
};

/**
 * Sincroniza URL (`/watch`, `/game`) com transmissão/jogo e restaura sessão no F5.
 * Usa `history.replaceState` para não remontar a sala ao mudar o sufixo da URL.
 */
export function useRoomSessionUrl({
  roomSlug,
  initialMode,
  roomAmbienceActive,
  ambienceEntered,
  immersionAmbience,
  resultsDismissedForEventId = null,
  onApplyWatchDeepLink,
  onGameDeepLinkDenied,
}: UseRoomSessionUrlArgs) {
  const nextPathname = usePathname();
  const [pathname, setPathname] = useState(nextPathname ?? "");
  const { activeEvent, eventShellOpen, myParticipation } = useRoomEventSession();
  const deepLinkResolvedRef = useRef(
    !initialMode && !parseRoomSessionModeFromPath(nextPathname ?? ""),
  );
  const watchWaitStartedRef = useRef<number | null>(null);
  const gameDeniedNotifiedRef = useRef(false);

  const base = roomBasePath(roomSlug);
  const replacePath = useCallback((path: string) => {
    replaceRoomBrowserPath(path);
    setPathname(path);
  }, []);

  useEffect(() => {
    setPathname(nextPathname ?? "");
  }, [nextPathname]);

  const pathMode = parseRoomSessionModeFromPath(pathname);
  const requestedMode = pathMode ?? initialMode ?? null;
  const inGameForUrl = participantInActiveGame(myParticipation, activeEvent?.status);

  // Deep link: /watch ou /game
  useEffect(() => {
    if (deepLinkResolvedRef.current || !requestedMode) return;

    if (requestedMode === "watch") {
      if (watchWaitStartedRef.current == null) {
        watchWaitStartedRef.current = Date.now();
      }

      if (roomAmbienceActive) {
        onApplyWatchDeepLink();
        deepLinkResolvedRef.current = true;
        return;
      }

      const waited = Date.now() - watchWaitStartedRef.current;
      if (waited < WATCH_AMBIENCE_WAIT_MS) return;

      deepLinkResolvedRef.current = true;
      if (pathname !== base) replacePath(base);
      return;
    }

    if (requestedMode === "game") {
      if (!activeEvent) return;

      deepLinkResolvedRef.current = true;

      const dismissedCurrentEvent =
        resultsDismissedForEventId != null && activeEvent.id === resultsDismissedForEventId;

      if (!inGameForUrl && !dismissedCurrentEvent) {
        if (!gameDeniedNotifiedRef.current) {
          gameDeniedNotifiedRef.current = true;
          onGameDeepLinkDenied?.();
        }
        if (pathname !== base) replacePath(base);
      }
    }
  }, [
    requestedMode,
    roomAmbienceActive,
    activeEvent,
    inGameForUrl,
    resultsDismissedForEventId,
    base,
    pathname,
    replacePath,
    onApplyWatchDeepLink,
    onGameDeepLinkDenied,
  ]);

  // Atualiza URL ao entrar/sair de transmissão ou jogo
  useEffect(() => {
    if (!deepLinkResolvedRef.current) return;

    const currentMode = parseRoomSessionModeFromPath(pathname);

    if (eventShellOpen && inGameForUrl) {
      const target = roomGamePath(roomSlug);
      if (pathname !== target) replacePath(target);
      return;
    }

    if (immersionAmbience || (roomAmbienceActive && ambienceEntered)) {
      const target = roomWatchPath(roomSlug);
      if (pathname !== target) replacePath(target);
      return;
    }

    if (currentMode === "watch" || currentMode === "game") {
      if (pathname !== base) replacePath(base);
    }
  }, [
    pathname,
    roomSlug,
    base,
    replacePath,
    eventShellOpen,
    inGameForUrl,
    immersionAmbience,
    roomAmbienceActive,
    ambienceEntered,
  ]);
}
