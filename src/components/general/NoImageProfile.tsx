import { User } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";

export default function NoImageProfile({
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="relative">
      <div
        className={twMerge(
          "w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center",
          rest.className
        )}
      >
        <User className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}
