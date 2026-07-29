"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoorOpen, Users } from "lucide-react";
import { apiFetch } from "@/services/apiFetch";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";

type ActiveRoom = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  online_now: number;
  capacity: number;
};

export function ActiveRoomsCard() {
  const [rooms, setRooms] = useState<ActiveRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await apiFetch("/api/feed/active-rooms", {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setRooms(data);
        }
      } catch {
        if (!cancelled) setRooms([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="border-border/50 bg-card backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-glow-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <DoorOpen className="h-5 w-5 text-neon-green" />
          <span>Salas ativas</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <LoadingComponent text="Carregando salas..." showText={false} />
        ) : rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma sala com atividade agora.{" "}
            <Link href="/rooms" className="text-primary hover:underline">
              Explorar salas
            </Link>
          </p>
        ) : (
          rooms.map((room) => (
            <Link
              key={room.id}
              href={`/rooms/${room.slug}`}
              className="block rounded-xl bg-muted/60 p-3 transition-colors hover:bg-muted/80"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <h4 className="truncate text-sm font-medium text-foreground">
                  {room.name}
                </h4>
                <span className="flex shrink-0 items-center gap-1 text-xs text-neon-green">
                  <Users className="h-3 w-3" />
                  {room.online_now}
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {room.summary}
              </p>
            </Link>
          ))
        )}

        <Link
          href="/rooms"
          className="block pt-1 text-center text-xs font-medium text-primary hover:underline"
        >
          Ver todas as salas
        </Link>
      </CardContent>
    </Card>
  );
}
