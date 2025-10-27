export const getCloudinaryVideoUrl = (public_id: string, width?: number) => {
  const url = `https://res.cloudinary.com/dg5o3xko6/video/upload/c_limit,w_${
    width ? width : "auto"
  }/f_auto/q_auto/v1/${public_id}`;
  return url;
};
