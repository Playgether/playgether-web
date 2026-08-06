export const getCloudinaryVideoUrl = (public_id: string, width?: number) => {
  const cloud =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dg5o3xko6";
  const w = width ?? "auto";
  return `https://res.cloudinary.com/${cloud}/video/upload/c_limit,w_${w}/f_auto/q_auto/${public_id}`;
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
