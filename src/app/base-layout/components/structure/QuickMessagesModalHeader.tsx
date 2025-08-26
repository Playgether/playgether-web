import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React from "react";

export default function QuickMessagesModalHeader() {
  return (
    <DialogHeader className="pb-4">
      <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
        Mensagem Rápida
      </DialogTitle>
    </DialogHeader>
  );
}
