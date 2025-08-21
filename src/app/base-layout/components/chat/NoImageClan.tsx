import { Crown } from "lucide-react";
import React from "react";

export default function NoImageClan() {
  return (
    <div className="relative">
      <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
        <Crown className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}
