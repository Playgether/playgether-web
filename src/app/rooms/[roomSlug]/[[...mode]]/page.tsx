import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { getChatRoomDetailed } from "@/services/getChatRoomDetailed";
import { extractRoomFromDetailedBody } from "@/services/chatRoomApi";
import { roomWatchPath } from "@/lib/roomRoutes";
import type { RoomPageMode } from "../RoomPageContent";
import { RoomPageContent } from "../RoomPageContent";

export const dynamic = "force-dynamic";

type ResolvedSessionMode = RoomPageMode | "live-legacy";

function resolveSessionMode(mode?: string[]): ResolvedSessionMode {
  const segment = mode?.[0];
  if (!segment) return undefined;
  if (segment === "watch") return "watch";
  if (segment === "game") return "game";
  if (segment === "live") return "live-legacy";
  notFound();
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { roomSlug, mode } = await params;
  const sessionMode = resolveSessionMode(mode);
  if (sessionMode === "live-legacy") {
    return { title: "Playgether - Salas" };
  }

  const detailed = await getChatRoomDetailed(String(roomSlug));
  if (detailed.status === "banned") {
    return { title: "Playgether - Salas" };
  }
  const payload = detailed.status === "ok" ? detailed.data : null;
  const { room } = extractRoomFromDetailedBody(payload ?? undefined);
  const roomName = room?.group_name || "Sala";

  if (sessionMode === "watch") {
    return { title: `Playgether - ${roomName} · Assistindo` };
  }
  if (sessionMode === "game") {
    return { title: `Playgether - ${roomName} · Jogo` };
  }
  return { title: `Playgether - ${roomName}` };
}

export default async function Page({
  params,
}: {
  params: Promise<{ roomSlug: string; mode?: string[] }>;
}) {
  const { roomSlug, mode } = await params;
  const sessionMode = resolveSessionMode(mode);

  if (sessionMode === "live-legacy") {
    redirect(roomWatchPath(String(roomSlug)));
  }

  return <RoomPageContent roomSlug={String(roomSlug)} mode={sessionMode} />;
}
