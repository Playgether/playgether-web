import { Button } from "@/components/ui/button";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import React from "react";

export default function MoreOptions() {
  return (
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground lg:h-8 lg:w-8"
      >
        <MoreHorizontal className="h-4 w-4 lg:h-5 lg:w-5" />
      </Button>
    </DropdownMenuTrigger>
  );
}
