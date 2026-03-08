export const getCloudinaryUrl = (public_id: string, width?: number) => {
  if (!public_id) return "";
  const w = width ?? "auto";
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dg5o3xko6"}/image/upload/c_limit,w_${w}/f_auto/q_auto/${public_id}`;
};
