import { Users } from "lucide-react";
import React from "react";

export default function NoImageGroup() {
  return (
    <div className="relative">
      <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
        <Users className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}
