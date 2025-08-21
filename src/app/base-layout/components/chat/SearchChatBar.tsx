import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";

function SearchChatBar() {
  return (
    <div className="px-4 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar conversas..."
          className="pl-10 bg-muted/20 border-border/50"
        />
      </div>
    </div>
  );
}

export default SearchChatBar;
