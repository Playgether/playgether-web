import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import React from "react";

export default function SettingsHeader() {
  return (
    <DialogHeader>
      <DialogTitle className="text-xl font-bold flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
          <Settings className="w-4 h-4 text-white" />
        </div>
        <span>Configurações</span>
      </DialogTitle>
    </DialogHeader>
  );
}
