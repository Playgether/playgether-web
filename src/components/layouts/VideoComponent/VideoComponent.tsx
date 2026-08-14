import { VideoComponentProps } from "@/types/VideoComponent";
import {
  getCloudinaryVideoMasterUrl,
  getCloudinaryVideoUrl,
} from "@/app/utils/getCloudinaryVideo";

function resolveVideoSrc(
  media_id: string,
  delivery: "feed" | "master",
  width?: number,
) {
  if (!media_id) return "";
  if (media_id.startsWith("http") || media_id.startsWith("/")) return media_id;
  if (delivery === "master") return getCloudinaryVideoMasterUrl(media_id);
  return getCloudinaryVideoUrl(media_id, width);
}

function VideoComponent({
  media_id,
  className,
  width,
  delivery = "feed",
  allowFullscreen = true,
  controls = true,
  controlsList,
  ...rest
}: VideoComponentProps) {
  const resolvedControlsList =
    controlsList ?? (allowFullscreen ? undefined : "nofullscreen");

  return (
    <video
      src={resolveVideoSrc(media_id, delivery, width)}
      className={[
        className,
        allowFullscreen ? null : "video-controls-no-fullscreen",
      ]
        .filter(Boolean)
        .join(" ")}
      controls={controls}
      controlsList={resolvedControlsList}
      {...rest}
    />
  );
}

export default VideoComponent;
