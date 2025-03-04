import { FeedProps } from "@/types/FeedProps";

interface ApiResponse {
  data: FeedProps[];
}
const FeedComponent = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export default FeedComponent;
