import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageCircle } from "lucide-react";
import React from "react";

export default function ChatTabs() {
  return (
    <TabsList className="grid grid-cols-2 bg-muted/50">
      <TabsTrigger value="private" className="text-xs gap-1">
        <MessageCircle className="w-4 h-4" />
        Privadas
      </TabsTrigger>
      <TabsTrigger value="group" className="text-xs gap-1">
        <Users className="w-4 h-4" />
        Grupos
      </TabsTrigger>
    </TabsList>
  );
}
