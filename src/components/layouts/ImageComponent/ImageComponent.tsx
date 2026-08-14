import Image from "next/legacy/image";
import { twJoin } from "tailwind-merge";
import { ImageComponentProps } from "@/types/ImageComponentProps";
import {
  getCloudinaryMasterUrl,
  resolveGameMediaUrl,
} from "@/app/utils/getCloudinaryUrl";

function resolveSrc(media_id: string, delivery: "feed" | "master") {
  if (!media_id) return "";
  if (media_id.startsWith("http") || media_id.startsWith("/")) return media_id;
  if (delivery === "master") return getCloudinaryMasterUrl(media_id);
  return resolveGameMediaUrl(media_id);
}

function ImageComponent({
  media_id,
  objectFit = "cover",
  layout = "fill",
  alt = "Image",
  className,
  delivery = "feed",
  ...rest
}: ImageComponentProps) {
  return (
    <Image
      src={resolveSrc(media_id, delivery)}
      objectFit={objectFit}
      layout={layout}
      className={twJoin(className)}
      alt={alt}
      {...rest}
    />
  );
}

export default ImageComponent;
