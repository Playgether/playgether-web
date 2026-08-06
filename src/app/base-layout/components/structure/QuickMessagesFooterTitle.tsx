import { Megaphone } from "lucide-react";
import React from "react";

export default function QuickMessagesFooterTitle() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-secondary lg:h-8 lg:w-8">
        <Megaphone className="h-3.5 w-3.5 text-white lg:h-4 lg:w-4" />
      </div>
      <span className="shrink-0 whitespace-nowrap text-sm font-bold transition-colors hover:text-primary lg:text-base">
        Alto Falante
      </span>
    </div>
  );
}
