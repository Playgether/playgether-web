import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import avatars
import avatarSophia from "@/assets/avatar-sophia.jpg";
import Conversations from "./Conversations";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import { MessageInterface } from "../../types/chat/MessageInterface";
import InputMessage from "./InputMessage";
import { ConversationInterface } from "../../types/chat/ConversationInterface";
import { useBaseLayoutServerContext } from "../../context/BaseLayoutServerContext";

interface ConversationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  {
    id: "1",
    sender: "Sophia Andrade",
    content: "Oi! Como você está?",
    timestamp: "14:30",
    isOwn: false,
  },
  {
    id: "2",
    sender: "Você",
    content: "Oi! Tudo bem e você?",
    timestamp: "14:31",
    isOwn: true,
  },
  {
    id: "3",
    sender: "Sophia Andrade",
    content: "Vamos jogar Apex hoje?",
    timestamp: "14:32",
    isOwn: false,
  },
];

export const ConversationsModal = ({
  open,
  onOpenChange,
}: ConversationsModalProps) => {
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationInterface | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const { BaseLayout } = useBaseLayoutServerContext();

  const onSelectConversation = (conversation: ConversationInterface) => {
    setSelectedConversation(conversation);
  };

  const onInput = (value: string) => {
    setMessageInput(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full p-0 bg-background/95 backdrop-blur-xl border border-primary/20">
        {BaseLayout.ServerConversationsModal.components.ChatModalHeader}
        <div className="flex h-[70vh]">
          {/* Conversations List */}
          <div className="w-1/3 border-r p-0 border-border/50 ">
            <Tabs defaultValue="private" className="h-full">
              {BaseLayout.ServerConversationsModal.components.ChatTabs}
              {BaseLayout.ServerConversationsModal.components.SearchBar}

              <TabsContent value="private" className="mt-0 p-0">
                <ScrollArea className="h-[calc(100%_-_120px)]">
                  <Conversations
                    conversations={conversations}
                    onSelectConversation={onSelectConversation}
                    selectedConversation={selectedConversation}
                    type="private"
                    notFoundMessage="Nenhuma conversa encontrada."
                    fallbackAvatar={
                      BaseLayout.ServerConversationsModal.components
                        .NoImageProfile
                    }
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="clan" className="mt-0">
                <ScrollArea className="h-[calc(100%_-_120px)]">
                  <Conversations
                    conversations={conversations}
                    onSelectConversation={onSelectConversation}
                    selectedConversation={selectedConversation}
                    type="clan"
                    notFoundMessage="Nenhum clan encontrado."
                    fallbackAvatar={
                      BaseLayout.ServerConversationsModal.components.NoImageClan
                    }
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="group" className="mt-0">
                <Conversations
                  conversations={conversations}
                  onSelectConversation={onSelectConversation}
                  selectedConversation={selectedConversation}
                  type="group"
                  notFoundMessage="Nenhum grupo encontrado."
                  fallbackAvatar={
                    BaseLayout.ServerConversationsModal.components.NoImageGroup
                  }
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <ChatHeader selectedConversation={selectedConversation} />

                {/* Messages */}
                <ScrollArea className="flex-1 p-4 pt-2">
                  <ChatMessages messages={mockMessages} />
                </ScrollArea>

                {/* Message Input */}
                <InputMessage onInput={onInput} messageInput={messageInput} />
              </>
            ) : (
              BaseLayout.ServerConversationsModal.components
                .NoConversationSelected
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
