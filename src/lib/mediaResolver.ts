import type { MediaTrack } from "@/types/RoomMusic";

export class MediaResolveError extends Error {
  readonly status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "MediaResolveError";
    this.status = status;
  }
}

/**
 * Resolves a YouTube URL into a full MediaTrack via the backend resolver.
 * The proxy route at /api/media/resolve handles authentication automatically
 * using the httpOnly accessToken cookie — no token arg needed.
 *
 * Throws MediaResolveError on validation or network failures.
 */
export async function resolveMediaTrack(youtubeUrl: string): Promise<MediaTrack> {
  const raw = youtubeUrl.trim();
  if (!raw) {
    throw new MediaResolveError("Informe um link do YouTube.");
  }

  let res: Response;
  try {
    res = await fetch("/api/media/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: raw }),
    });
  } catch {
    throw new MediaResolveError("Erro de rede. Verifique sua conexão.");
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new MediaResolveError("Resposta inválida do servidor.", res.status);
  }

  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in data && typeof (data as Record<string, unknown>).error === "string"
        ? (data as { error: string }).error
        : "Não foi possível resolver a mídia.";
    throw new MediaResolveError(msg, res.status);
  }

  return data as MediaTrack;
}
