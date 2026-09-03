"use client";

import { patchChatRoomSettings } from "@/actions/chatRoomMutations";
import {
  deleteCloudinaryImage,
  deleteCloudinaryRoomAmbientAsset,
} from "@/services/cloudinary_requests/deletePostFile";
import {
  AMBIENT_VIDEO_MAX_DURATION_SEC,
  AMBIENT_VIDEO_MAX_LONG_SIDE,
  AMBIENT_VIDEO_MAX_SHORT_SIDE,
  getRoomAmbientMode,
  parseAmbientMediaValue,
  resolveAmbientAbsoluteUrl,
  storedValueFromUploadResult,
} from "@/app/utils/roomAmbientMedia";
import type { AmbientPeriodKey } from "@/app/utils/roomAmbientPeriod";
import { PresetsCloudinary } from "@/components/content_types/PresetsCloudinary";
import {
  BYTES_10_MB,
  BYTES_100_MB,
  BYTES_8_MB,
  CLOUDINARY_IMAGE_AND_VIDEO_FORMATS,
  CLOUDINARY_IMAGE_FORMATS,
  unwrapPreBatchBlob,
  videoExceedsMaxDuration,
} from "@/app/utils/cloudinaryUploadConfig";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useRoomPermissions } from "@/context/RoomPermissionsContext";
import {
  ChatRoom,
  RoomAmbientMode,
  RoomAmbientSettings,
} from "@/types/ChatRoom";
import { CldUploadWidget } from "next-cloudinary";
import {
  CloudMoon,
  Image as ImageIcon,
  Loader2,
  Moon,
  RefreshCw,
  Sun,
  Sunrise,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const PERIODS = [
  { key: "morning" as const, label: "Manhã", Icon: Sunrise },
  { key: "afternoon" as const, label: "Tarde", Icon: Sun },
  { key: "night" as const, label: "Noite", Icon: Moon },
  { key: "dawn" as const, label: "Madrugada", Icon: CloudMoon },
] as const;

const FIXED_SLOT = {
  key: "fixed" as const,
  label: "Fundo fixo",
  Icon: ImageIcon,
};

type AmbientMediaKey = AmbientPeriodKey | "fixed";
type EditableAmbientSettings = Record<AmbientMediaKey, string> & {
  mode: RoomAmbientMode;
};

function ambientFromRoom(room: ChatRoom): EditableAmbientSettings {
  const from = room.ambient_images ?? {};
  return {
    mode: getRoomAmbientMode(from),
    fixed: String(from.fixed ?? ""),
    morning: String(from.morning ?? ""),
    afternoon: String(from.afternoon ?? ""),
    night: String(from.night ?? ""),
    dawn: String(from.dawn ?? ""),
  };
}

interface RoomImagesPanelProps {
  room: ChatRoom;
  onAmbientImagesUpdated?: (next: RoomAmbientSettings) => void;
}

export default function RoomImagesPanel({
  room,
  onAmbientImagesUpdated,
}: RoomImagesPanelProps) {
  const [ambientSettings, setAmbientSettings] =
    useState<EditableAmbientSettings>(() => ambientFromRoom(room));
  const ambientRef = useRef<EditableAmbientSettings>(ambientFromRoom(room));

  const [expandedImage, setExpandedImage] = useState<{
    url: string;
    label: string;
    isVideo: boolean;
  } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [bannerPublicId, setBannerPublicId] = useState<string>(
    room.banner ?? "",
  );
  const bannerRef = useRef<string>(room.banner ?? "");

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const validateAmbientMedia = useMemo(
    () =>
      (
        done: (options?: { cancel?: boolean }) => void,
        data: { files?: unknown[] },
      ) => {
        const entry = data?.files?.[0];
        const file = unwrapPreBatchBlob(entry);
        const meta =
          entry && typeof entry === "object"
            ? (entry as { type?: string; name?: string })
            : null;
        const mime = (file && "type" in file ? file.type : "") || meta?.type || "";
        const name =
          (file && "name" in file && typeof (file as File).name === "string"
            ? (file as File).name
            : undefined) ||
          meta?.name ||
          "";
        const isVideo =
          mime.startsWith("video/") ||
          mime === "video" ||
          /\.(mp4|mov|webm|m4v)$/i.test(name);

        if (!file) {
          done();
          return;
        }
        if (!isVideo) {
          setError(null);
          done();
          return;
        }
        const objectUrl = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(objectUrl);
          const w = video.videoWidth;
          const h = video.videoHeight;
          const long = Math.max(w, h);
          const short = Math.min(w, h);
          if (
            !Number.isFinite(video.duration) ||
            video.duration > AMBIENT_VIDEO_MAX_DURATION_SEC + 0.25
          ) {
            setError("Vídeo: duração máxima de 3 minutos.");
            done({ cancel: true });
            return;
          }
          if (
            long > AMBIENT_VIDEO_MAX_LONG_SIDE ||
            short > AMBIENT_VIDEO_MAX_SHORT_SIDE
          ) {
            setError(
              "Vídeo: resolução máxima Full HD (1920×1080, qualquer orientação).",
            );
            done({ cancel: true });
            return;
          }
          setError(null);
          done();
        };
        video.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          setError("Não foi possível ler o vídeo. Tente outro arquivo.");
          done({ cancel: true });
        };
        video.src = objectUrl;
      },
    [],
  );

  /** Evita onSuccess duplicado do widget Cloudinary (mesmo upload). */
  const lastAmbientDedupe = useRef<string | null>(null);
  const lastBannerDedupe = useRef<string | null>(null);

  /** Vários PATCH em sequência não devem apagar o loading cedo demais. */
  const saveOpsRef = useRef(0);
  const beginSave = () => {
    saveOpsRef.current += 1;
    setIsSaving(true);
  };
  const endSave = () => {
    saveOpsRef.current = Math.max(0, saveOpsRef.current - 1);
    if (saveOpsRef.current === 0) setIsSaving(false);
  };

  const { can } = useRoomPermissions();
  const canManage = can("room.images.manage");

  useEffect(() => {
    const from = ambientFromRoom(room);
    ambientRef.current = from;
    setAmbientSettings(from);
    const b = room.banner ?? "";
    bannerRef.current = b;
    setBannerPublicId(b);
  }, [room.slug]);

  const persistAmbientImages = async (
    next: EditableAmbientSettings,
  ): Promise<boolean> => {
    beginSave();
    setError(null);
    try {
      const res = await patchChatRoomSettings(room.slug, {
        ambient_images: next,
      });
      if (!res.ok) {
        setError(res.error);
        return false;
      }
      return true;
    } finally {
      endSave();
    }
  };

  const persistBanner = async (publicId: string | null): Promise<boolean> => {
    beginSave();
    setError(null);
    try {
      const res = await patchChatRoomSettings(room.slug, {
        banner: publicId,
      });
      if (!res.ok) {
        setError(res.error);
        return false;
      }
      return true;
    } finally {
      endSave();
    }
  };

  const handleAmbientModeChange = (mode: RoomAmbientMode) => {
    if (mode === ambientRef.current.mode || !canManage || isSaving) return;
    const snapshot = { ...ambientRef.current };
    const next = { ...ambientRef.current, mode };
    ambientRef.current = next;
    setAmbientSettings(next);
    void (async () => {
      const ok = await persistAmbientImages(next);
      if (ok) {
        onAmbientImagesUpdated?.(next);
      } else {
        ambientRef.current = snapshot;
        setAmbientSettings(snapshot);
      }
    })();
  };

  const handleRemoveAmbient = (key: AmbientMediaKey) => {
    const previousId = ambientRef.current[key];
    if (!previousId || !canManage) return;
    const snapshot = { ...ambientRef.current };
    const next = { ...ambientRef.current, [key]: "" };
    ambientRef.current = next;
    setAmbientSettings(next);
    void (async () => {
      const ok = await persistAmbientImages(next);
      if (ok) {
        onAmbientImagesUpdated?.(next);
        const removed = await deleteCloudinaryRoomAmbientAsset(previousId);
        if (!removed) {
          setError(
            "A mídia foi removida da sala, mas o arquivo antigo pode não ter sido apagado do armazenamento.",
          );
        }
      } else {
        ambientRef.current = snapshot;
        setAmbientSettings(snapshot);
      }
    })();
  };

  const handleAmbientUploadSuccess = async (
    key: AmbientMediaKey,
    result: {
      info?: {
        public_id?: string;
        asset_id?: string;
        resource_type?: string;
        duration?: number;
        width?: number;
        height?: number;
      };
    },
  ) => {
    const stored = storedValueFromUploadResult(result?.info ?? {});
    if (!stored || !canManage) return;

    if (videoExceedsMaxDuration(result?.info, AMBIENT_VIDEO_MAX_DURATION_SEC)) {
      await deleteCloudinaryRoomAmbientAsset(stored);
      setError("Vídeo: duração máxima de 3 minutos.");
      return;
    }

    const dedupeKey = `${key}:${stored}:${result?.info?.asset_id ?? ""}`;
    if (lastAmbientDedupe.current === dedupeKey) return;
    lastAmbientDedupe.current = dedupeKey;

    const previousId = ambientRef.current[key] || "";
    const snapshot = { ...ambientRef.current };
    const next = { ...ambientRef.current, [key]: stored };
    ambientRef.current = next;
    setAmbientSettings(next);

    const ok = await persistAmbientImages(next);
    if (!ok) {
      await deleteCloudinaryRoomAmbientAsset(stored);
      ambientRef.current = snapshot;
      setAmbientSettings(snapshot);
      return;
    }

    onAmbientImagesUpdated?.(next);

    if (previousId && previousId !== stored) {
      const removed = await deleteCloudinaryRoomAmbientAsset(previousId);
      if (!removed) {
        setError(
          "A nova mídia foi salva, mas a anterior não pôde ser removida do armazenamento. Tente substituir de novo.",
        );
      }
    }
  };

  const handleBannerUploadSuccess = async (result: {
    info?: { public_id?: string; asset_id?: string };
  }) => {
    const publicId = result?.info?.public_id;
    if (!publicId || !canManage) return;

    const dedupeKey = `${publicId}:${result?.info?.asset_id ?? ""}`;
    if (lastBannerDedupe.current === dedupeKey) return;
    lastBannerDedupe.current = dedupeKey;

    const previousId = bannerRef.current || "";
    bannerRef.current = publicId;
    setBannerPublicId(publicId);

    const ok = await persistBanner(publicId);
    if (!ok) {
      await deleteCloudinaryImage(publicId);
      bannerRef.current = previousId;
      setBannerPublicId(previousId);
      return;
    }

    if (previousId && previousId !== publicId) {
      const removed = await deleteCloudinaryImage(previousId);
      if (!removed) {
        setError(
          "O novo banner foi salvo, mas o arquivo anterior não pôde ser removido do armazenamento. Tente trocar de novo.",
        );
      }
    }
  };

  return (
    <div className="h-full space-y-5 overflow-y-auto bg-muted/50 p-4">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <ImageIcon className="h-5 w-5 text-muted-foreground" />
        Imagens da sala
      </h2>

      {!canManage ? (
        <p className="rounded-lg border border-border/50 bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Apenas o criador da sala pode alterar imagens.
        </p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : null}

      <div className="mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="relative aspect-[16/9] min-h-[160px] max-h-[260px] overflow-hidden sm:min-h-[200px]">
            {bannerPublicId ? (
              <ImageComponent media_id={bannerPublicId} alt={room.group_name} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted/60">
                <ImageIcon className="h-7 w-7 text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <h3 className="text-xs font-bold text-white drop-shadow-md">
                Banner da sala
              </h3>
            </div>
            {canManage ? (
              <div className="absolute right-1.5 top-1.5 flex gap-1">
                <CldUploadWidget
                  signatureEndpoint="/api/signed-room-banner"
                  options={{
                    uploadPreset: PresetsCloudinary.chat_room_banner,
                    sources: ["local"],
                    multiple: false,
                    maxFiles: 1,
                    resourceType: "image",
                    clientAllowedFormats: [...CLOUDINARY_IMAGE_FORMATS],
                    maxImageFileSize: BYTES_8_MB,
                    language: "pt-br",
                    styles: { zIndex: 200000 },
                  }}
                  onSuccess={(result: unknown) =>
                    void handleBannerUploadSuccess(
                      result as {
                        info?: { public_id?: string; asset_id?: string };
                      },
                    )
                  }
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      disabled={isSaving}
                      className="rounded-md bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70 disabled:opacity-50"
                      title="Trocar banner"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  )}
                </CldUploadWidget>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Sunrise className="h-3.5 w-3.5" />
          Ambientação do chat
        </h3>
        <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg border border-border/60 bg-muted/40 p-1">
          {(
            [
              ["fixed", "Fundo fixo"],
              ["schedule", "Por horário"],
            ] as const
          ).map(([mode, label]) => {
            const active = ambientSettings.mode === mode;
            return (
              <button
                key={mode}
                type="button"
                aria-pressed={active}
                disabled={!canManage || isSaving}
                onClick={() => handleAmbientModeChange(mode)}
                className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="mb-2 text-[11px] text-muted-foreground">
          {ambientSettings.mode === "fixed"
            ? "Use uma única mídia durante todo o dia. "
            : "Defina uma mídia diferente para cada período. "}
          Imagem ou vídeo. Vídeo: até {AMBIENT_VIDEO_MAX_DURATION_SEC / 60} min,
          Full HD ({AMBIENT_VIDEO_MAX_LONG_SIDE}×
          {AMBIENT_VIDEO_MAX_SHORT_SIDE}px no máximo).
        </p>
        <div
          className={
            ambientSettings.mode === "fixed"
              ? "grid max-w-md grid-cols-1 gap-2"
              : "grid grid-cols-2 gap-2"
          }
        >
          {(ambientSettings.mode === "fixed" ? [FIXED_SLOT] : PERIODS).map((p) => {
            const rawAmbient = ambientSettings[p.key];
            const parsedAmbient = parseAmbientMediaValue(rawAmbient);
            const hasMedia = !!parsedAmbient;
            return (
              <div
                key={p.key}
                className="group relative overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div
                  className={`relative aspect-[16/10] overflow-hidden ${
                    hasMedia ? "cursor-pointer" : ""
                  }`}
                  onClick={() => {
                    if (parsedAmbient) {
                      setImageLoaded(parsedAmbient.kind === "video");
                      setExpandedImage({
                        url: resolveAmbientAbsoluteUrl(parsedAmbient),
                        label: p.label,
                        isVideo: parsedAmbient.kind === "video",
                      });
                    }
                  }}
                >
                  {parsedAmbient ? (
                    parsedAmbient.kind === "video" ? (
                      <video
                        src={resolveAmbientAbsoluteUrl(parsedAmbient)}
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <ImageComponent
                        media_id={parsedAmbient.publicId}
                        alt={p.label}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/60">
                      <p.Icon className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1.5 p-1.5">
                    <p.Icon className="h-3 w-3 text-white drop-shadow-md" />
                    <span className="text-[11px] font-semibold text-white drop-shadow-md">
                      {p.label}
                    </span>
                  </div>

                  {canManage ? (
                    <div className="absolute right-1.5 top-1.5 flex gap-1">
                      <CldUploadWidget
                        signatureEndpoint="/api/signed-room-ambiance"
                        options={{
                          uploadPreset: PresetsCloudinary.rooms_ambiance,
                          sources: ["local"],
                          multiple: false,
                          maxFiles: 1,
                          resourceType: "auto",
                          clientAllowedFormats: [
                            ...CLOUDINARY_IMAGE_AND_VIDEO_FORMATS,
                          ],
                          maxImageFileSize: BYTES_10_MB,
                          maxVideoFileSize: BYTES_100_MB,
                          language: "pt-br",
                          styles: { zIndex: 200000 },
                          preBatch: validateAmbientMedia,
                        }}
                        onSuccess={(result: unknown) =>
                          void handleAmbientUploadSuccess(
                            p.key,
                            result as {
                              info?: {
                                public_id?: string;
                                asset_id?: string;
                                resource_type?: string;
                              };
                            },
                          )
                        }
                      >
                        {({ open }) => (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              open();
                            }}
                            disabled={isSaving}
                            className="rounded-md bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70 disabled:opacity-50"
                            title="Trocar imagem ou vídeo"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                      </CldUploadWidget>
                      {hasMedia ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAmbient(p.key);
                          }}
                          disabled={isSaving}
                          className="rounded-md bg-black/50 p-1.5 text-white transition-colors hover:bg-destructive/80 disabled:opacity-50"
                          title="Remover mídia"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog
        open={!!expandedImage}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setExpandedImage(null);
            setImageLoaded(false);
          }
        }}
      >
        <DialogContent className="max-w-3xl p-2">
          <VisuallyHidden>
            <DialogTitle>{expandedImage?.label ?? "Mídia da sala"}</DialogTitle>
          </VisuallyHidden>
          {expandedImage ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
              {expandedImage.isVideo ? (
                <>
                  <video
                    src={expandedImage.url}
                    controls
                    playsInline
                    className="h-auto max-h-[80vh] w-full rounded-lg"
                    onLoadedData={() => setImageLoaded(true)}
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    {expandedImage.label}
                  </span>
                </>
              ) : (
                <>
                  {!imageLoaded ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : null}
                  <img
                    src={expandedImage.url}
                    alt={expandedImage.label}
                    className={`h-auto max-h-[80vh] w-full rounded-lg object-contain transition-opacity ${
                      imageLoaded ? "opacity-100" : "absolute opacity-0"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                  />
                  {imageLoaded ? (
                    <span className="text-sm font-medium text-muted-foreground">
                      {expandedImage.label}
                    </span>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
