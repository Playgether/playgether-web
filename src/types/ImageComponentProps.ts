import { ImageProps } from "next/legacy/image";

export interface ImageComponentProps extends Omit<ImageProps, "src"> {
  media_id: string;
}
