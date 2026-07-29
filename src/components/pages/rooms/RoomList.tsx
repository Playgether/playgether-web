"use client";

import { favoriteToggleChatRoom } from "@/actions/favoriteToggleChatRoom";
import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Gamepad2, Plus, Search, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import CreateRoomModal from "./CreateRoomModal";
import { useRoomExpelledForList } from "./RoomExpelledNotice";
import RoomCard, { type RoomCardData } from "./RoomCard";
import RoomCardSkeleton from "./RoomCardSkeleton";

const OCCUPANCY_POLL_MS = 15_000;

interface RoomListProps {
  rooms: RoomCardData[];
  initialOccupancy?: Record<string, number>;
}

function occupancyMatches(
  prev: Record<string, number>,
  next: Record<string, number>,
): boolean {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const key of keys) {
    if (prev[key] !== next[key]) return false;
  }
  return true;
}

export default function RoomList({
  rooms,
  initialOccupancy = {},
}: RoomListProps) {
  const expelled = useRoomExpelledForList();
  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [localRooms, setLocalRooms] = useState<RoomCardData[]>(rooms);
  const [occupancy, setOccupancy] =
    useState<Record<string, number>>(initialOccupancy);
  const [occupancyReady, setOccupancyReady] = useState(
    () =>
      rooms.length === 0 ||
      rooms.every((room) => initialOccupancy[String(room.id)] !== undefined),
  );
  const [favorites, setFavorites] = useState<Set<number>>(
    () =>
      new Set(rooms.filter((room) => room.isFavorited).map((room) => room.id)),
  );
  const [, startFavoriteTransition] = useTransition();
  const occupancyRef = useRef(occupancy);
  occupancyRef.current = occupancy;

  const handleRoomCreated = (newRoom: RoomCardData) => {
    setLocalRooms((prev) => {
      if (prev.some((r) => r.id === newRoom.id)) return prev;
      return [newRoom, ...prev];
    });
  };

  const searchedRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return localRooms;
    return localRooms.filter(
      (room) =>
        room.name.toLowerCase().includes(q) ||
        room.summary.toLowerCase().includes(q),
    );
  }, [localRooms, search]);

  const idsSignature = useMemo(
    () =>
      localRooms
        .map((r) => r.id)
        .sort((a, b) => a - b)
        .join(","),
    [localRooms],
  );

  useEffect(() => {
    if (!idsSignature) return undefined;

    let cancelled = false;

    const tick = () => {
      if (document.visibilityState === "hidden") return;

      fetch(`/api/chatrooms/occupancy?ids=${encodeURIComponent(idsSignature)}`)
        .then((res) => (res.ok ? res.json() : {}))
        .then((data: Record<string, number>) => {
          if (cancelled || !data || typeof data !== "object") return;
          if (!occupancyMatches(occupancyRef.current, data)) {
            setOccupancy(data);
          }
          setOccupancyReady(true);
        })
        .catch(() => {});
    };

    tick();
    const interval = setInterval(tick, OCCUPANCY_POLL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [idsSignature]);

  const displayRooms = useMemo(() => {
    const base = showFavorites
      ? searchedRooms.filter((room) => favorites.has(room.id))
      : searchedRooms;
    return base.map((room) => ({
      ...room,
      onlineNow: occupancy[String(room.id)],
    }));
  }, [searchedRooms, showFavorites, favorites, occupancy]);

  const handleToggleFavorite = (roomId: number, favorite: boolean) => {
    setFavorites((currentFavorites) => {
      const nextFavorites = new Set(currentFavorites);

      if (favorite) {
        nextFavorites.add(roomId);
      } else {
        nextFavorites.delete(roomId);
      }

      return nextFavorites;
    });

    startFavoriteTransition(async () => {
      const room = localRooms.find((r) => r.id === roomId);
      if (!room?.slug) return;
      await favoriteToggleChatRoom(room.slug, favorite ? "POST" : "DELETE");
    });
  };

  const noSearchMatches =
    localRooms.length > 0 && searchedRooms.length === 0 && search.trim() !== "";

  const showSkeletons =
    !occupancyReady && displayRooms.length > 0 && search.trim() === "";

  return (
    <section className="min-h-layout-main w-full bg-background">
      <CreateRoomModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onRoomCreated={handleRoomCreated}
      />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Gamepad2 className="h-5 w-5 shrink-0" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                Salas
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              <span className="bg-gradient-to-r from-primary via-neon-blue to-neon-purple bg-clip-text text-transparent">
                Chat Rooms
              </span>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
              Encontre sua tribo e entre na conversa
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="gradient-primary w-full shrink-0 gap-2 font-semibold text-primary-foreground shadow-glow-primary hover:opacity-95 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Criar sala
          </Button>
        </header>

        <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar por nome ou sumário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted/60 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Buscar salas"
            />
          </div>

          <div
            className="inline-flex shrink-0 self-start rounded-lg border border-border bg-muted/60 p-1 sm:self-auto"
            role="tablist"
            aria-label="Filtrar salas"
          >
            <button
              type="button"
              role="tab"
              aria-selected={!showFavorites}
              onClick={() => setShowFavorites(false)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-semibold transition-all",
                !showFavorites
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Todas
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={showFavorites}
              onClick={() => setShowFavorites(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-all",
                showFavorites
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Star className="h-3.5 w-3.5" />
              Favoritas
            </button>
          </div>
        </div>

        {localRooms.length === 0 ? (
          <NotFoundPages
            message="Não encontramos nenhuma sala disponível no momento"
            href="/feed"
            page="Feed"
          />
        ) : noSearchMatches ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="mb-2 text-xl">Nenhuma sala corresponde à busca</p>
            <p className="text-sm">
              Tente outro termo ou limpe o campo de busca.
            </p>
          </div>
        ) : displayRooms.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="mb-2 text-xl">
              {showFavorites
                ? "Nenhuma sala favorita ainda"
                : "Nenhuma sala nesta lista"}
            </p>
            <p className="text-sm">
              {showFavorites ? "Clique no coração para favoritar salas" : null}
            </p>
          </div>
        ) : showSkeletons ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayRooms.map((room) => (
              <RoomCardSkeleton key={room.id} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isFavorite={favorites.has(room.id)}
                onToggleFavorite={handleToggleFavorite}
                occupancyLoading={room.onlineNow === undefined}
                expelledNotice={
                  expelled && (expelled.slug === room.slug || !expelled.slug)
                    ? expelled.message
                    : null
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
