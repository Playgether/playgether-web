"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import avatarSophia from "@/assets/avatar-sophia.jpg";
import Conversations from "./Conversations";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import InputMessage from "./InputMessage";
import ChatTabs from "./ChatTabs";
import NoConversationSelected from "./NoConversationSelected";
import NoImageClan from "./NoImageClan";
import NoImageGroup from "./NoImageGroup";
import { ConversationInterface } from "../../types/chat/ConversationInterface";
import { MessageInterface } from "../../types/chat/MessageInterface";
import { AvatarFallback } from "@/components/ui/avatar";

const conversations: ConversationInterface[] = [
  {
    id: "1",
    name: "Sophia Andrade",
    avatar: avatarSophia,
    lastMessage: "Vamos jogar Apex hoje?",
    timestamp: "14:32",
    unread: 2,
    type: "private",
  },
  {
    id: "2",
    name: "Aline Moreira",
    avatar: "",
    lastMessage: "Consegui passar de level!",
    timestamp: "13:45",
    type: "private",
  },
  {
    id: "3",
    name: "Clã Dragons",
    avatar: "",
    lastMessage: "Torneio amanhã às 20h",
    timestamp: "12:30",
    unread: 5,
    type: "clan",
  },
];

const mockMessages: MessageInterface[] = [
  { id: "1", sender: "Sophia Andrade", content: "Oi! Como você está?", timestamp: "14:30", isOwn: false },
  { id: "2", sender: "Você", content: "Oi! Tudo bem e você?", timestamp: "14:31", isOwn: true },
  { id: "3", sender: "Sophia Andrade", content: "Vamos jogar Apex hoje?", timestamp: "14:32", isOwn: false },
];

const NoImageProfile = <AvatarFallback className="bg-gradient-primary text-white font-bold">?</AvatarFallback>;

interface ConversationsContentProps {
  /** Altura do painel de mensagens — ajustável para página vs widget */
  listHeight?: string;
  chatHeight?: string;
}

export function ConversationsContent({
  listHeight = "calc(100% - 120px)",
  chatHeight = "flex-1",
}: ConversationsContentProps) {
  const [selectedConversation, setSelectedConversation] = useState<ConversationInterface | null>(null);
  const [messageInput, setMessageInput] = useState("");

  return (
    <div className="flex h-full">
      {/* Lista de conversas */}
      <div className="w-1/3 border-r border-border/50 flex flex-col">
        <Tabs defaultValue="private" className="h-full flex flex-col">
          <div className="pt-4">
            <ChatTabs />
          </div>

          <TabsContent value="private" className="mt-0 p-0 flex-1 overflow-hidden">
            <ScrollArea style={{ height: listHeight }}>
              <Conversations
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
                selectedConversation={selectedConversation}
                type="private"
                notFoundMessage="Nenhuma conversa encontrada."
                fallbackAvatar={NoImageProfile}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="clan" className="mt-0 flex-1 overflow-hidden">
            <ScrollArea style={{ height: listHeight }}>
              <Conversations
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
                selectedConversation={selectedConversation}
                type="clan"
                notFoundMessage="Nenhum clã encontrado."
                fallbackAvatar={<NoImageClan />}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="group" className="mt-0 flex-1 overflow-hidden">
            <ScrollArea style={{ height: listHeight }}>
              <Conversations
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
                selectedConversation={selectedConversation}
                type="group"
                notFoundMessage="Nenhum grupo encontrado."
                fallbackAvatar={<NoImageGroup />}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            <ChatHeader selectedConversation={selectedConversation} />
            <ScrollArea className={chatHeight + " p-4 pt-2"}>
              <ChatMessages messages={mockMessages} />
            </ScrollArea>
            <InputMessage onInput={setMessageInput} messageInput={messageInput} />
          </>
        ) : (
          <NoConversationSelected />
        )}
      </div>
    </div>
  );
}
