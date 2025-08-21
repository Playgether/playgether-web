import React from "react";
import { GamerSidebar } from "./GamerSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { TopNavigation } from "./TopNavigation";
import { QuickMessagesFooter } from "./QuickMessagesFooter";
import IsMobileWrapper from "./isMobileWrapper";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <IsMobileWrapper
        gamerSidebar={<GamerSidebar />}
        button={
          <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-label="Open menu"
            onClick={() => {}}
            className="fixed top-4 left-4 z-50 w-12 h-12 rounded-xl bg-background/80 backdrop-blur-xl border border-border/50"
          >
            <Menu aria-hidden="true" className="w-6 h-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        }
      />

      {/* Top Navigation */}
      <TopNavigation />

      {children}

      {/* Quick Messages Footer */}
      <QuickMessagesFooter />
    </div>
  );
}
