import { HTMLAttributes } from "react";

export interface ImageComponentProps extends HTMLAttributes<HTMLDivElement> {
  media_id: string;
  width?: number;
  objectFit?: string;
  layout?: string;
}
