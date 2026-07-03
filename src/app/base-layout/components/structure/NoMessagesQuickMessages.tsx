import { Megaphone } from "lucide-react";
import React from "react";

export default function NoMessagesQuickMessages() {
  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-secondary lg:h-8 lg:w-8">
          <Megaphone className="h-3.5 w-3.5 text-white lg:h-4 lg:w-4" />
        </div>
        <span className="text-sm font-bold lg:text-lg">Alto-falante</span>
      </div>
      <div className="min-w-0 flex-1 text-center lg:pr-32">
        <p className="truncate text-xs text-muted-foreground lg:text-lg lg:font-bold">
          Não há mensagens no momento
        </p>
      </div>
    </>
  );
}
