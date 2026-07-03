import React from "react";
import { GamerSidebar } from "./GamerSidebar";
import { TopNavigation } from "./TopNavigation";
import { QuickMessagesFooter } from "./QuickMessagesFooter";
import { MobileBottomNav } from "./MobileBottomNav";
import BaseLayoutProvider from "../../context/BaseLayoutProvider";
import { CreatePostModal } from "@/app/feed/components/CreatePostModal";
import { ConversationsWidget } from "../chat/ConversationsWidget";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BaseLayoutProvider>
      <div className="min-h-screen w-full overflow-x-hidden bg-background lg:w-screen lg:pr-4">
        {/* Sidebar — apenas desktop */}
        <div className="hidden lg:block">
          <GamerSidebar />
        </div>

        {/* Navegação inferior — apenas mobile/tablet */}
        <MobileBottomNav />

        <TopNavigation />

        <div className="pb-[calc(var(--layout-quick-messages-height)+var(--layout-bottom-nav-height))] pt-[var(--layout-header-height)] lg:pb-[var(--layout-quick-messages-height)]">
          {children}
        </div>

        <CreatePostModal />

        <QuickMessagesFooter />

        <div className="hidden lg:block">
          <ConversationsWidget />
        </div>
      </div>
    </BaseLayoutProvider>
  );
}
