import { Metadata } from "next";
import BaseLayout from "../base-layout/components/structure/BaseLayout";
import { ConversationsContent } from "../base-layout/components/chat/ConversationsContent";

export const metadata: Metadata = {
  title: "Playgether - Conversas",
  description: "Suas conversas privadas, de clã e grupos",
};

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  const { open } = await searchParams;
  return (
    <BaseLayout>
      <div className="flex h-[calc(100dvh-var(--layout-header-height)-var(--layout-quick-messages-height)-var(--layout-bottom-nav-height))] flex-col bg-background lg:ml-20 lg:h-layout-main">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden p-3 sm:p-4 md:p-6">
          <h1 className="mb-3 shrink-0 text-lg font-bold sm:mb-4 sm:text-xl">Conversas</h1>
          <div className="flex-1 overflow-hidden rounded-xl border border-border/50 bg-card/30 shadow-card min-h-0">
            <ConversationsContent
              listHeight="100%"
              chatHeight="flex-1"
              autoOpenId={open}
            />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
