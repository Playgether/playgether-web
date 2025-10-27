export const getCloudinaryUrl = (public_id: string, width?: number) => {
  // return `https://res.cloudinary.com/dg5o3xko6/video/upload/c_limit,q_auto:good,w_${width}/v1742654555/${public_id}`;
  const url = `https://res.cloudinary.com/dg5o3xko6/c_limit,w_${
    width ? width : "auto"
  }/f_auto/q_auto/v1/${public_id}`;
  return url;
};
