import { User } from "lucide-react";
import React from "react";
import { twMerge, twJoin } from "tailwind-merge";

interface NoImageProfileProps extends React.HTMLAttributes<HTMLDivElement> {
  iconClassName?: string;
}

export default function NoImageProfile({
  iconClassName,
  ...rest
}: NoImageProfileProps) {
  return (
    <div className="relative">
      <div
        className={twMerge(
          "w-12 h-12 bg-muted-foreground rounded-full flex items-center justify-center",
          rest.className,
        )}
      >
        <User className={twJoin("", iconClassName)} />
      </div>
    </div>
  );
}
