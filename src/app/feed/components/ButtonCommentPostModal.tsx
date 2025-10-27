import { MessageCircle } from "lucide-react";
import React from "react";

export default function ButtonCommentPostModal() {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Seja o primeiro a comentar</p>
      </div>
    </div>
  );
}
