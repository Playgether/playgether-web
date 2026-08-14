import {
  EAGER_WIDTHS_FEED,
  snapEagerWidth,
} from "@/app/utils/cloudinaryUploadConfig";

const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dg5o3xko6";

/**
 * Delivery alinhado aos eagers de imagem (c_limit + q_auto:good + width).
 * `f_auto` fica na entrega para HEIC/WebP por browser (não vai no incoming/eager).
 * Sem `width`, usa 1280 (eager padrão do feed).
 */
export const getCloudinaryUrl = (public_id: string, width?: number) => {
  if (!public_id) return "";
  const w = snapEagerWidth(width, EAGER_WIDTHS_FEED);
  const quality = w === 480 ? "eco" : "good";
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_limit,q_auto:${quality},w_${w}/f_auto/${public_id}`;
};

/**
 * Master do asset (incoming já limita a 1920). Sem `w_` — para lightbox/expandido.
 * Não gera eager nova; o CDN entrega o original otimizado com f_auto.
 */
export const getCloudinaryMasterUrl = (public_id: string) => {
  if (!public_id) return "";
  return `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:good/f_auto/${public_id}`;
};

/** URL absoluta, relativa ou public_id Cloudinary — mesmo critério da biblioteca de jogos no perfil. */
export function resolveGameMediaUrl(value: string | null | undefined): string {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (value.startsWith("/")) return value;
  return getCloudinaryUrl(value);
}
