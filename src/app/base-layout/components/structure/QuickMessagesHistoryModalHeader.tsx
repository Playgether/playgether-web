import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React from "react";

export default function QuickMessagesHistoryModalHeader() {
  return (
    <DialogHeader className="pb-4 border-b border-border/50">
      <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
        Histórico de Mensagens Rápidas
      </DialogTitle>
    </DialogHeader>
  );
}
