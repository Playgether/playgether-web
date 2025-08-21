export const getCloudinaryVideoUrl = (width: number, public_id: string) => {
  return `https://res.cloudinary.com/dg5o3xko6/video/upload/c_limit,w_${width}/f_auto/q_auto/v1/${public_id}`;
};
