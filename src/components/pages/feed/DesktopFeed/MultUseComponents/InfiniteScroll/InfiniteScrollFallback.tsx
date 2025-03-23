import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { HTMLAttributes } from "react";
import { twJoin } from "tailwind-merge";

interface InfiniteScrollProps extends HTMLAttributes<HTMLDivElement> {
  message: string;
}

const InfiniteScrollFallback = ({ message, ...rest }: InfiniteScrollProps) => {
  return (
    <div className="w-full flex items-center justify-center text-center">
      <div
        className={twJoin(
          "rounded MiddleIsFetching-wrapper flex flex-col justify-center",
          rest.className
        )}
      >
        <h1 className="font-bold text-lg">Um momento por favor</h1>
        <div className="flex justify-center items-center gap-2">
          <p>{message}</p>
          <div className="w-fit">
            <LoadingComponent className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfiniteScrollFallback;
