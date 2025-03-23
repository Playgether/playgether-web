import BaseLayout from "@/components/layouts/BaseLayout";
import { Metadata } from "next";
import React from "react";
import { ChatComponents } from "@/components/elements/Chat";

export interface Props {
  params?: { name: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Playgether - ${params?.name || "Sala Desconhecida"}`,
  };
}

export default function Page({ params }: Props) {
  return (
    <BaseLayout>
      <ChatComponents.Root>
        <ChatComponents.LeftRoomChat />
        <ChatComponents.RightRoomChat group_name={params?.name} />
      </ChatComponents.Root>
    </BaseLayout>
  );
}
