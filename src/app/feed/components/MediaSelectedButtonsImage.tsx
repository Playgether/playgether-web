import { Button } from "@/components/ui/button";
import React from "react";
import { Image } from "lucide-react";

export default function MediaSelectedButtonsImage() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-primary"
      asChild
    >
      <span>
        <Image className="w-5 h-5" />
      </span>
    </Button>
  );
}
