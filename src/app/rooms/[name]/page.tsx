import BaseLayout from "@/components/layouts/BaseLayout";
import { Metadata } from "next";
import React from "react";
import { ChatComponents } from "@/components/elements/Chat";

export async function generateMetadata({ params }): Promise<Metadata> {
  const { name } = await params;
  return {
    title: `Playgether - ${name || "Sala Desconhecida"}`,
  };
}

export default async function Page({ params }) {
  const { name } = await params;
  return (
    <BaseLayout>
      <ChatComponents.Root>
        <ChatComponents.LeftRoomChat />
        <ChatComponents.RightRoomChat group_name={name} />
      </ChatComponents.Root>
    </BaseLayout>
  );
}
