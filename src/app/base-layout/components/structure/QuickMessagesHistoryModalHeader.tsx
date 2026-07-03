import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React from "react";

export default function QuickMessagesHistoryModalHeader() {
  return (
    <DialogHeader className="border-b border-border/50 pb-3 sm:pb-4">
      <DialogTitle className="bg-gradient-primary bg-clip-text text-lg font-bold text-transparent sm:text-2xl">
        Histórico de Mensagens Rápidas
      </DialogTitle>
    </DialogHeader>
  );
}
