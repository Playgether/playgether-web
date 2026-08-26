import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageCircle } from "lucide-react";
import React from "react";

export default function ChatTabs() {
  return (
    <TabsList className="grid h-9 w-full grid-cols-2 items-stretch overflow-hidden rounded-lg border border-border/40 bg-muted p-0.5">
      <TabsTrigger
        value="private"
        className="h-full gap-1.5 rounded-md px-3 py-0 text-xs shadow-none sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-none"
      >
        <MessageCircle className="h-3.5 w-3.5 shrink-0" />
        Privadas
      </TabsTrigger>
      <TabsTrigger
        value="group"
        className="h-full gap-1.5 rounded-md px-3 py-0 text-xs shadow-none sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-none"
      >
        <Users className="h-3.5 w-3.5 shrink-0" />
        Grupos
      </TabsTrigger>
    </TabsList>
  );
}
