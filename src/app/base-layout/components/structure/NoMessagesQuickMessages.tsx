import { Megaphone } from "lucide-react";
import React from "react";

export default function NoMessagesQuickMessages() {
  return (
    <>
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
          <Megaphone className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg">Alto-falante</span>{" "}
      </div>
      <div className="text-center flex-1 pr-32 font-bold text-lg">
        <p className="text-muted-foreground">Não há mensagens no momento</p>
      </div>
    </>
  );
}
