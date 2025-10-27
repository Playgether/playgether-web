import { PostProps } from "./PostProps";

export interface ResponseFeed {
  data: PostProps[];
  next_page?: URL | null;
  previous_page?: URL | null;
}
