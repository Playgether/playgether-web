import {
  EAGER_WIDTHS_BANNER,
  EAGER_WIDTHS_FEED,
  EAGER_WIDTHS_PROFILE_PHOTO,
  snapEagerWidth,
} from "@/app/utils/cloudinaryUploadConfig";

const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dg5o3xko6";

const PROFILE_PHOTO_PREFIXES = ["profile-photos/", "profile/photos/"] as const;
const PROFILE_BANNER_PREFIXES = ["profile-banners/", "profile/banners/"] as const;

function matchesPublicIdPrefix(
  publicId: string,
  prefixes: readonly string[],
): boolean {
  return prefixes.some((prefix) => publicId.startsWith(prefix));
}

export function isProfilePhotoPublicId(publicId: string): boolean {
  return matchesPublicIdPrefix(publicId, PROFILE_PHOTO_PREFIXES);
}

export function isProfileBannerPublicId(publicId: string): boolean {
  return matchesPublicIdPrefix(publicId, PROFILE_BANNER_PREFIXES);
}

/**
 * Aplica o recorte escolhido no Upload Widget (`custom_coordinates`) antes do resize.
 * Sem `g_custom`, o Cloudinary entrega a imagem inteira e o CSS centraliza com object-cover.
 */
function withCustomCropTransformation(
  publicId: string,
  resizeSegment: string,
): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_crop,g_custom/${resizeSegment}/${publicId}`;
}

/**
 * Delivery de foto de perfil — respeita o crop do widget (c_crop,g_custom + eager widths).
 */
export const getCloudinaryProfilePhotoUrl = (
  public_id: string,
  width?: number,
) => {
  if (!public_id) return "";
  const w = snapEagerWidth(width, EAGER_WIDTHS_PROFILE_PHOTO);
  const quality = w <= 128 ? "eco" : "good";
  return withCustomCropTransformation(
    public_id,
    `c_limit,q_auto:${quality},w_${w}/f_auto`,
  );
};

/**
 * Delivery de banner de perfil — respeita o crop do widget (c_crop,g_custom + eager widths).
 */
export const getCloudinaryProfileBannerUrl = (
  public_id: string,
  width?: number,
) => {
  if (!public_id) return "";
  const w = snapEagerWidth(width, EAGER_WIDTHS_BANNER);
  const quality = w <= 720 ? "eco" : "good";
  return withCustomCropTransformation(
    public_id,
    `c_limit,q_auto:${quality},w_${w}/f_auto`,
  );
};

/**
 * Delivery alinhado aos eagers de imagem (c_limit + q_auto:good + width).
 * `f_auto` fica na entrega para HEIC/WebP por browser (não vai no incoming/eager).
 * Sem `width`, usa 1280 (eager padrão do feed).
 */
export const getCloudinaryUrl = (public_id: string, width?: number) => {
  if (!public_id) return "";
  if (isProfilePhotoPublicId(public_id)) {
    return getCloudinaryProfilePhotoUrl(public_id, width);
  }
  if (isProfileBannerPublicId(public_id)) {
    return getCloudinaryProfileBannerUrl(public_id, width);
  }
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
  if (isProfilePhotoPublicId(public_id) || isProfileBannerPublicId(public_id)) {
    return withCustomCropTransformation(public_id, "q_auto:good/f_auto");
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:good/f_auto/${public_id}`;
};

/** URL absoluta, relativa ou public_id Cloudinary — mesmo critério da biblioteca de jogos no perfil. */
export function resolveGameMediaUrl(
  value: string | null | undefined,
  width?: number,
): string {
  if (!value) return "";
  if (value.startsWith("http") || value.startsWith("/")) return value;
  return getCloudinaryUrl(value, width);
}
