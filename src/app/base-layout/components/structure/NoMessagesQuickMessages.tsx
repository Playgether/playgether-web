import { Megaphone } from "lucide-react";
import React from "react";

export default function NoMessagesQuickMessages() {
  return (
    <>
      <div className="relative z-10 flex shrink-0 items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-secondary lg:h-8 lg:w-8">
          <Megaphone className="h-3.5 w-3.5 text-white lg:h-4 lg:w-4" />
        </div>
        <span className="text-sm font-bold transition-colors hover:text-primary lg:text-base">
          Alto-falante
        </span>
      </div>
      <p className="pointer-events-none absolute inset-x-0 text-center text-xs text-muted-foreground lg:text-base">
        Não há mensagens no momento
      </p>
    </>
  );
}
