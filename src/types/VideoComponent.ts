import { VideoHTMLAttributes } from "react";

export interface VideoComponentProps
  extends VideoHTMLAttributes<HTMLVideoElement> {
  media_id: string;
  width?: number;
  controls?: boolean;
  /** `feed` (default) = eager 1280; `master` = qualidade máxima do arquivo salvo. */
  delivery?: "feed" | "master";
  /**
   * Se false, esconde o botão nativo de fullscreen (`controlsList=nofullscreen`).
   * Chromium/Edge/Android; Safari pode ignorar.
   */
  allowFullscreen?: boolean;
}
