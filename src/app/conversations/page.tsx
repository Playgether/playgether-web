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
      <div className="h-layout-main bg-background ml-0 md:ml-20 flex flex-col">
        <div className="max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col flex-1 overflow-hidden">
          <h1 className="text-xl font-bold mb-4 shrink-0">Conversas</h1>
          <div className="flex-1 overflow-hidden rounded-xl border border-border/50 bg-card/30 shadow-card">
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
