import { ImageProps } from "next/legacy/image";

export interface ImageComponentProps extends Omit<ImageProps, "src"> {
  media_id: string;
  /** `feed` (default) = eager 1280; `master` = qualidade máxima do arquivo salvo. */
  delivery?: "feed" | "master";
}
