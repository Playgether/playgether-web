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

export const POST_VIDEO_MAX_DURATION_SEC = 90;
export const MILESTONE_VIDEO_MAX_DURATION_SEC = 30;
export const AMBIENT_VIDEO_MAX_DURATION_SEC = 180;
export const AMBIENT_VIDEO_MAX_LONG_SIDE = 1920;
export const AMBIENT_VIDEO_MAX_SHORT_SIDE = 1080;

const VIDEO_EXT_RE = /\.(mp4|mov|webm|m4v)$/i;
const IMAGE_EXT_RE = /\.(jpe?g|png|webp|heic|heif|gif|avif)$/i;

type PreBatchFileMeta = {
  type?: string;
  name?: string;
  size?: number;
  file?: unknown;
  nativeFile?: unknown;
  slice?: (start?: number, end?: number, contentType?: string) => Blob;
};

function isBlobLike(value: unknown): value is Blob {
  // Não usar `instanceof Blob`: o Upload Widget pode rodar em iframe
  // e o File vem de outro realm, falhando no instanceof do window pai.
  if (!value || typeof value !== "object") return false;
  const candidate = value as PreBatchFileMeta;
  return (
    typeof candidate.size === "number" &&
    typeof candidate.slice === "function" &&
    typeof candidate.type === "string"
  );
}

function isVideoLike(file: PreBatchFileMeta): boolean {
  const blob = unwrapPreBatchBlob(file);
  const type = (blob && "type" in blob ? blob.type : "") || file.type || "";
  const name =
    (blob && "name" in blob && typeof (blob as File).name === "string"
      ? (blob as File).name
      : undefined) ||
    file.name ||
    "";

  if (type.startsWith("video/") || type === "video") return true;
  if (type.startsWith("image/") || type === "image") return false;
  if (VIDEO_EXT_RE.test(name)) return true;
  if (IMAGE_EXT_RE.test(name)) return false;
  return false;
}

/**
 * O Upload Widget nem sempre entrega um `File`/`Blob` puro em `data.files`.
 * Em vários fluxos o item é um wrapper com `file` / `nativeFile`.
 * Também evita `instanceof` por causa de arquivos vindos de iframe.
 */
export function unwrapPreBatchBlob(entry: unknown): Blob | null {
  if (isBlobLike(entry)) return entry as Blob;
  if (!entry || typeof entry !== "object") return null;

  const candidate = entry as Record<string, unknown>;
  for (const key of ["file", "nativeFile", "originalFile", "rawFile"]) {
    if (isBlobLike(candidate[key])) return candidate[key] as Blob;
  }
  for (const value of Object.values(candidate)) {
    if (isBlobLike(value)) return value as Blob;
  }
  return null;
}

function filesFromPreBatch(data: { files?: unknown[] }) {
  return (data?.files ?? []).filter(
    (f): f is PreBatchFileMeta => !!f && typeof f === "object",
  );
}

function readVideoDuration(file: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    const release = () => URL.revokeObjectURL(objectUrl);

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const { duration } = video;
      release();
      if (!Number.isFinite(duration)) {
        reject(new Error("Duração de vídeo inválida"));
        return;
      }
      resolve(duration);
    };
    video.onerror = () => {
      release();
      reject(new Error("Não foi possível ler o vídeo"));
    };
    video.src = objectUrl;
  });
}

export function createVideoDurationPreBatchValidator(opts: {
  maxDurationSec: number;
  onError: (message: string) => void;
}) {
  return (
    done: (options?: { cancel?: boolean }) => void,
    data: { files?: unknown[] },
  ) => {
    const videos = filesFromPreBatch(data).filter(isVideoLike);
    if (!videos.length) {
      done();
      return;
    }

    // O widget roda em iframe e normalmente entrega só metadados aqui.
    // Sem o arquivo não dá para medir a duração: segue o upload e deixa a
    // checagem definitiva para `videoExceedsMaxDuration` no onSuccess.
    const blobs = videos
      .map(unwrapPreBatchBlob)
      .filter((blob): blob is Blob => !!blob);
    if (!blobs.length) {
      done();
      return;
    }

    void Promise.all(blobs.map((blob) => readVideoDuration(blob)))
      .then((durations) => {
        if (
          durations.some(
            (duration) => duration > opts.maxDurationSec + 0.25,
          )
        ) {
          opts.onError(
            `Vídeos devem ter no máximo ${opts.maxDurationSec} segundos.`,
          );
          done({ cancel: true });
          return;
        }
        done();
      })
      .catch(() => {
        // Metadados ilegíveis aqui não devem travar o envio: o onSuccess
        // ainda valida a duração informada pelo Cloudinary.
        done();
      });
  };
}

export interface CloudinaryUploadInfo {
  resource_type?: string;
  duration?: number;
  public_id?: string;
  width?: number;
  height?: number;
}

/** Duração real do asset, já processada pelo Cloudinary (só vem em vídeo). */
export function videoExceedsMaxDuration(
  info: CloudinaryUploadInfo | undefined,
  maxDurationSec: number,
): boolean {
  if (info?.resource_type !== "video") return false;
  const { duration } = info;
  if (typeof duration !== "number" || !Number.isFinite(duration)) return false;
  return duration > maxDurationSec + 0.25;
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
