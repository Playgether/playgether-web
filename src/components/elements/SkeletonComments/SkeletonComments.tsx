import { Skeleton } from "@/components/ui/skeleton";
import { twJoin } from "tailwind-merge";

const SkeletonComments = ({ ...rest }) => {
  return (
    <div className={twJoin("flex items-center space-x-4 p-4", rest.className)}>
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 w-full">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
};

export default SkeletonComments;
