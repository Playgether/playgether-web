import React from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

function ChatModalHeader() {
  return (
    <DialogHeader className="p-6 pb-4 border-b border-border/50 ">
      <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
        Conversas
      </DialogTitle>
    </DialogHeader>
  );
}

export default ChatModalHeader;
