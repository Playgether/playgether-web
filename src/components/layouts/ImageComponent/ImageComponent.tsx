import Image from "next/legacy/image";
import { getCloudinaryUrl } from "@/functions/getCloudinaryUrl";
import { twJoin } from "tailwind-merge";
import { ImageComponentProps } from "@/types/ImageComponentProps";

function ImageComponent({
  media_id,
  width = 1280,
  objectFit = "cover",
  layout = "fill",
  ...rest
}: ImageComponentProps) {
  return (
    <Image
      src={getCloudinaryUrl(width, media_id)}
      objectFit="cover"
      layout="fill"
      className={twJoin(rest.className)}
    />
  );
}

export default ImageComponent;
