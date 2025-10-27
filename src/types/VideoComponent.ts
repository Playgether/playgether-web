import { VideoHTMLAttributes } from "react";

export interface VideoComponentProps
  extends VideoHTMLAttributes<HTMLVideoElement> {
  media_id: string;
  width?: number;
  controls?: boolean;
}
