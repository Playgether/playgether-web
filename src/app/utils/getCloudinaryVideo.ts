export const getCloudinaryVideoUrl = (public_id: string, width?: number) => {
  const cloud =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dg5o3xko6";
  const w = width ?? "auto";
  return `https://res.cloudinary.com/${cloud}/video/upload/c_limit,w_${w}/f_auto/q_auto/${public_id}`;
};
