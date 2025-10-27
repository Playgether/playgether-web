import Image from "next/legacy/image";
import { twJoin } from "tailwind-merge";
import { ImageComponentProps } from "@/types/ImageComponentProps";
import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";

function ImageComponent({
  media_id,
  objectFit = "cover",
  layout = "fill",
  alt = "Image",
  ...rest
}: ImageComponentProps) {
  return (
    <Image
      src={getCloudinaryUrl(media_id)}
      objectFit={objectFit}
      layout={layout}
      className={twJoin(rest.className)}
      alt={alt}
    />
  );
}

export default ImageComponent;
