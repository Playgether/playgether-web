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
      <div className="ml-20 h-[calc(100vh-var(--layout-header-height)-var(--layout-quick-messages-height))] flex flex-col">
        <div className="px-6 py-4 border-b border-border/50">
          <h1 className="text-xl font-bold">Conversas</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ConversationsContent
            listHeight="calc(100vh - 200px)"
            chatHeight="flex-1"
            autoOpenId={open}
          />
        </div>
      </div>
    </BaseLayout>
  );
}
