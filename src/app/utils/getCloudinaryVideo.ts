import {
  EAGER_WIDTHS_CUTS,
  EAGER_WIDTHS_VIDEO,
  snapEagerWidth,
} from "@/app/utils/cloudinaryUploadConfig";

const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dg5o3xko6";

/**
 * Delivery de vídeo alinhado aos eagers (c_limit + q_auto:good + width).
 * Sem `width`, usa 1280 (eager padrão do feed).
 */
export const getCloudinaryVideoUrl = (public_id: string, width?: number) => {
  if (!public_id) return "";
  const w = snapEagerWidth(width, EAGER_WIDTHS_VIDEO);
  const quality = w === 720 ? "eco" : "good";
  return `https://res.cloudinary.com/${cloudName}/video/upload/c_limit,q_auto:${quality},w_${w}/f_auto/${public_id}`;
};

/** Master do vídeo (incoming já limita a 1920). Para player expandido. */
export const getCloudinaryVideoMasterUrl = (public_id: string) => {
  if (!public_id) return "";
  return `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:good/f_auto/${public_id}`;
};

/**
 * Delivery de cut alinhado aos eagers (c_limit + q_auto + width).
 * Sem `width`, usa 720 (eager padrão de cuts).
 */
export const getCloudinaryCutVideoUrl = (public_id: string, width?: number) => {
  if (!public_id) return "";
  const w = snapEagerWidth(width, EAGER_WIDTHS_CUTS);
  const quality = w === 480 ? "eco" : "good";
  return `https://res.cloudinary.com/${cloudName}/video/upload/c_limit,q_auto:${quality},w_${w}/f_auto/${public_id}`;
};

/**
 * Deriva a thumbnail direto do public_id do vídeo (frame automático via Cloudinary).
 * Não depende do campo `thumbnail` armazenado, que pode vir como URL completa
 * em formatos inconsistentes vindos do widget de upload.
 */
export const getCloudinaryVideoThumbnail = (video_public_id: string, width = 400) => {
  if (!video_public_id) return "";
  const cloud =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dg5o3xko6";
  return `https://res.cloudinary.com/${cloud}/video/upload/so_auto,c_fill,w_${width},h_${Math.round(width * (16 / 9))}/${video_public_id}.jpg`;
};
