import { Megaphone } from "lucide-react";
import React from "react";

export default function NoMessagesQuickMessages() {
  return (
    <div className="flex min-w-0 w-full items-center gap-2 lg:gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-secondary lg:h-8 lg:w-8">
        <Megaphone className="h-3.5 w-3.5 text-white lg:h-4 lg:w-4" />
      </div>
      <span className="shrink-0 text-sm font-bold transition-colors hover:text-primary lg:text-base">
        Alto-falante
      </span>
      <p className="min-w-0 flex-1 truncate text-left text-xs text-muted-foreground lg:text-center lg:text-base">
        Não há mensagens no momento
      </p>
    </div>
  );
}
