import { Button } from "@/components/ui/button";
import React from "react";
import { Image, Video } from "lucide-react";

export default function MediaSelectedButtonsVideo() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-primary"
      asChild
    >
      <span>
        <Video className="w-5 h-5" />
      </span>
    </Button>
  );
}
