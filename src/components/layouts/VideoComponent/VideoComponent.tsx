import { twJoin } from "tailwind-merge";
import { VideoComponentProps } from "@/types/VideoComponent";
import { getCloudinaryVideoUrl } from "@/app/utils/getCloudinaryVideo";

function VideoComponent({
  media_id,
  controls = true,
  ...rest
}: VideoComponentProps) {
  return (
    <video
      src={getCloudinaryVideoUrl(media_id)}
      className={twJoin(rest.className)}
      controls={controls}
      {...rest}
    />
  );
}

export default VideoComponent;
