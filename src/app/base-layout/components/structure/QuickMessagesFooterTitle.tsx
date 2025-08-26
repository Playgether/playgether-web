import { Megaphone } from "lucide-react";
import React from "react";

export default function QuickMessagesFooterTitle() {
  return (
    <>
      <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
        <Megaphone className="w-4 h-4 text-white" />
      </div>
      <span className="font-bold hover:text-primary transition-colors w-[160px]">
        Auto Falante
      </span>
    </>
  );
}
