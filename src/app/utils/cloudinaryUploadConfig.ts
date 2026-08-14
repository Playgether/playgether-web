import { PresetsCloudinary } from "@/components/content_types/PresetsCloudinary";

/** Extensões aceitas no Upload Widget (alinhar ao Allowed formats do preset). */
export const CLOUDINARY_IMAGE_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
] as const;
export const CLOUDINARY_VIDEO_FORMATS = ["mp4", "mov"] as const;
export const CLOUDINARY_IMAGE_AND_VIDEO_FORMATS = [
  ...CLOUDINARY_IMAGE_FORMATS,
  ...CLOUDINARY_VIDEO_FORMATS,
] as const;

export const BYTES_5_MB = 5 * 1024 * 1024;
export const BYTES_8_MB = 8 * 1024 * 1024;
export const BYTES_10_MB = 10 * 1024 * 1024;
export const BYTES_50_MB = 50 * 1024 * 1024;
export const BYTES_100_MB = 100 * 1024 * 1024;

/** Larguras eager — delivery deve snapar para estas. */
export const EAGER_WIDTHS_FEED = [1280, 720, 480] as const;
export const EAGER_WIDTHS_BANNER = [2560, 1920, 1280, 720] as const;
export const EAGER_WIDTHS_PROFILE_PHOTO = [1024, 256, 128, 64] as const;
export const EAGER_WIDTHS_VIDEO = [1280, 720] as const;

export const POST_VIDEO_MAX_DURATION_SEC = 30;
export const MILESTONE_VIDEO_MAX_DURATION_SEC = 60;
export const AMBIENT_VIDEO_MAX_DURATION_SEC = 180;
export const AMBIENT_VIDEO_MAX_LONG_SIDE = 1920;
export const AMBIENT_VIDEO_MAX_SHORT_SIDE = 1080;

const VIDEO_EXT_RE = /\.(mp4|mov|webm|m4v)$/i;
const IMAGE_EXT_RE = /\.(jpe?g|png|webp|heic|heif|gif|avif)$/i;

function isVideoLike(file: { type?: string; name?: string }): boolean {
  if (file.type?.startsWith("video/")) return true;
  if (file.type?.startsWith("image/")) return false;
  const name = file.name ?? "";
  if (VIDEO_EXT_RE.test(name)) return true;
  if (IMAGE_EXT_RE.test(name)) return false;
  return false;
}

function filesFromPreBatch(data: { files?: unknown[] }) {
  return (data?.files ?? []).filter(
    (f): f is { type?: string; name?: string } =>
      !!f && typeof f === "object",
  );
}

/** Mensagem de lote misto — imagem e vídeo usam presets diferentes. */
export const MIXED_MEDIA_BATCH_MESSAGE =
  "Envie imagens e vídeos em seleções separadas.";

/**
 * Handlers pareados (preBatch + prepareUploadParams) com estado isolado por widget.
 *
 * `prepareUploadParams` não recebe nenhuma identificação do arquivo e o widget
 * assina na ordem em que os uploads começam, que não é a ordem de seleção do
 * `preBatch`. Por isso o lote precisa ter um único tipo: assim o preset vale
 * para todos os arquivos e não depende de ordem.
 */
export function createDualPresetUploadHandlers(opts: {
  signatureEndpoint: string;
  imagePreset: PresetsCloudinary;
  videoPreset: PresetsCloudinary;
  /** Avisa que o lote mistura imagem e vídeo (upload cancelado). */
  onRejectMixedBatch?: (message: string) => void;
  /**
   * Validação extra no preBatch (ex.: duração de ambientação).
   * Deve chamar done() ou done({ cancel: true }).
   */
  validatePreBatch?: (
    done: (options?: { cancel?: boolean }) => void,
    data: { files?: unknown[] },
  ) => void;
}) {
  let batchKind: "image" | "video" = "image";
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  /** Chamar ao abrir o widget: evita herdar o tipo do lote anterior. */
  const reset = () => {
    batchKind = "image";
  };

  const preBatch = (
    cb: (options?: { cancel?: boolean }) => void,
    data: { files?: unknown[] },
  ) => {
    const kinds = new Set(
      filesFromPreBatch(data).map((file) =>
        isVideoLike(file) ? "video" : "image",
      ),
    );

    if (kinds.size > 1) {
      opts.onRejectMixedBatch?.(MIXED_MEDIA_BATCH_MESSAGE);
      cb({ cancel: true });
      return;
    }

    batchKind = kinds.has("video") ? "video" : "image";

    if (opts.validatePreBatch) {
      opts.validatePreBatch(cb, data);
      return;
    }
    cb();
  };

  const prepareUploadParams = (
    cb: (params: Record<string, unknown> | Record<string, unknown>[]) => void,
    params: Record<string, unknown> | Record<string, unknown>[],
  ) => {
    if (!apiKey) {
      cb({ error: "NEXT_PUBLIC_CLOUDINARY_API_KEY não definido" });
      return;
    }

    const looksVideo = batchKind === "video";
    const upload_preset = looksVideo ? opts.videoPreset : opts.imagePreset;
    const list = Array.isArray(params) ? params : [params];

    void Promise.all(
      list.map(async (entry) => {
        const paramsToSign = { ...entry, upload_preset };

        const response = await fetch(opts.signatureEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paramsToSign }),
        });
        if (!response.ok) {
          throw new Error(`Falha ao assinar upload (${response.status})`);
        }
        const result = (await response.json()) as { signature?: string };
        if (!result.signature) {
          throw new Error("Assinatura Cloudinary ausente na resposta");
        }

        return {
          ...paramsToSign,
          signature: result.signature,
          api_key: apiKey,
          resourceType: looksVideo ? "video" : "image",
        };
      }),
    )
      .then((results) => {
        cb(results.length === 1 ? results[0]! : results);
      })
      .catch((error: unknown) => {
        console.error("Cloudinary prepareUploadParams:", error);
        cb({
          error:
            error instanceof Error
              ? error.message
              : "Falha ao preparar upload",
        });
      });
  };

  return { preBatch, prepareUploadParams, reset };
}

export function snapEagerWidth(
  requested: number | undefined,
  breakpoints: readonly number[],
): number {
  if (!breakpoints.length) return requested ?? 1280;
  const sortedDesc = [...breakpoints].sort((a, b) => b - a);
  if (requested == null || !Number.isFinite(requested) || requested <= 0) {
    return sortedDesc.includes(1280) ? 1280 : sortedDesc[0]!;
  }
  const sortedAsc = [...breakpoints].sort((a, b) => a - b);
  for (const bp of sortedAsc) {
    if (requested <= bp) return bp;
  }
  return sortedAsc[sortedAsc.length - 1]!;
}
