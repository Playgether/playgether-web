import { FeedProps } from "./FeedProps";

export interface PaginationProps {
  next: string;
  previous: string;
  results: FeedProps[];
}
