import { HTMLAttributes } from "react";
import { AiOutlineRetweet } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import { PiHeartFill } from "react-icons/pi";
import { twJoin } from "tailwind-merge";

interface PostsStatsProps extends HTMLAttributes<HTMLDivElement> {}

export const PostsStats = ({ ...rest }: PostsStatsProps) => {
  return (
    <div
      className={twJoin(
        "PostsStats-wrapper rounded-b-lg flex justify-between items-center px-8 h-10",
        rest.className
      )}
    >
      <div className="flex  gap-2 text-md justify-center items-center font-medium">
        <PiHeartFill className="PostsStats-icons h-6 w-6" />
        <p>250</p>
      </div>

      <div className="flex gap-2 text-md justify-center items-center font-medium">
        <FaComment className="PostsStats-icons h-5 w-5" />
        <p>178</p>
      </div>

      <div className="flex  gap-2 text-md justify-center items-center font-medium">
        <AiOutlineRetweet className="PostsStats-icons h-6 w-6" />
        <p>102</p>
      </div>
    </div>
  );
};
