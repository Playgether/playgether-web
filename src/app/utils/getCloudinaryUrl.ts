export const getCloudinaryUrl = (public_id: string, width?: number) => {
  if (!public_id) return "";
  const w = width ?? "auto";
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dg5o3xko6"}/image/upload/c_limit,w_${w}/f_auto/q_auto/${public_id}`;
};

/** URL absoluta, relativa ou public_id Cloudinary — mesmo critério da biblioteca de jogos no perfil. */
export function resolveGameMediaUrl(value: string | null | undefined): string {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (value.startsWith("/")) return value;
  return getCloudinaryUrl(value);
}
