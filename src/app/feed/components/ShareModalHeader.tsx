import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React from "react";

export default function ShareModalHeader() {
  return (
    <DialogHeader>
      <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
        Compartilhar Post
      </DialogTitle>
    </DialogHeader>
  );
}
