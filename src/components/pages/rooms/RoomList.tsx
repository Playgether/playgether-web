"use client";

import { favoriteToggleChatRoom } from "@/actions/favoriteToggleChatRoom";
import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Gamepad2, Plus, Search, Star } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import CreateRoomModal from "./CreateRoomModal";
import RoomCard, { type RoomCardData } from "./RoomCard";

interface RoomListProps {
  rooms: RoomCardData[];
}

export default function RoomList({ rooms }: RoomListProps) {
  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [occupancy, setOccupancy] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Set<number>>(
    () =>
      new Set(rooms.filter((room) => room.isFavorited).map((room) => room.id))
  );
  const [, startFavoriteTransition] = useTransition();

  const searchedRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(q) ||
        room.summary.toLowerCase().includes(q)
    );
  }, [rooms, search]);

  const idsSignature = useMemo(
    () =>
      rooms
        .map((r) => r.id)
        .sort((a, b) => a - b)
        .join(","),
    [rooms]
  );

  useEffect(() => {
    if (rooms.length === 0) return undefined;

    const tick = () => {
      const ids = rooms.map((r) => r.id).join(",");
      fetch(`/api/chatrooms/occupancy?ids=${encodeURIComponent(ids)}`)
        .then((res) => (res.ok ? res.json() : {}))
        .then((data: Record<string, number>) => {
          if (data && typeof data === "object") setOccupancy(data);
        })
        .catch(() => {});
    };

    tick();
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, [idsSignature, rooms.length]);

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
      const room = rooms.find((r) => r.id === roomId);
      if (!room?.slug) return;
      await favoriteToggleChatRoom(room.slug, favorite ? "POST" : "DELETE");
    });
  };

  const noSearchMatches =
    rooms.length > 0 && searchedRooms.length === 0 && search.trim() !== "";

  return (
    <section className="min-h-layout-main w-full bg-background">
      <CreateRoomModal open={createOpen} onOpenChange={setCreateOpen} />

      <header className="gradient-primary rounded-2xl px-4 py-8 text-center shadow-improved">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-2 flex items-center justify-center gap-3 text-3xl font-bold text-primary-foreground md:text-4xl">
            <Gamepad2 className="h-8 w-8" />
            Chat Rooms
          </h1>
          <p className="text-sm text-primary-foreground/80 md:text-base">
            Encontre sua tribo e entre na conversa
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-0 py-6 sm:px-4">
        <div className="mb-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="gradient-primary w-full shrink-0 gap-2 font-semibold text-primary-foreground shadow-glow-primary hover:opacity-95 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Criar sala
          </Button>
        </div>

        <div className="mb-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setShowFavorites(false)}
            className={cn(
              "rounded-full border px-6 py-2 text-sm font-semibold transition-all",
              !showFavorites
                ? "gradient-primary border-transparent text-primary-foreground shadow-glow-primary"
                : "border-border bg-muted/50 text-foreground hover:border-primary/40"
            )}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setShowFavorites(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-6 py-2 text-sm font-semibold transition-all",
              showFavorites
                ? "gradient-primary border-transparent text-primary-foreground shadow-glow-primary"
                : "border-border bg-muted/50 text-foreground hover:border-primary/40"
            )}
          >
            <Star className="h-3.5 w-3.5" />
            Favoritas
          </button>
        </div>

        <div className="relative mx-auto mb-8 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por nome ou sumário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Buscar salas"
          />
        </div>

        {rooms.length === 0 ? (
          <NotFoundPages
            message="Não encontramos nenhuma sala disponível no momento"
            href="/feed"
            page="Feed"
          />
        ) : noSearchMatches ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="mb-2 text-xl">Nenhuma sala corresponde à busca</p>
            <p className="text-sm">Tente outro termo ou limpe o campo de busca.</p>
          </div>
        ) : displayRooms.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="mb-2 text-xl">
              {showFavorites
                ? "Nenhuma sala favorita ainda"
                : "Nenhuma sala nesta lista"}
            </p>
            <p className="text-sm">
              {showFavorites
                ? "Clique no coração para favoritar salas"
                : null}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isFavorite={favorites.has(room.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
