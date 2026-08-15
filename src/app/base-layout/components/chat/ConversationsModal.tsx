import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  const Components = BaseLayout?.ServerConversationsModal?.components;

  const onSelectConversation = (conversation: ConversationInterface) => {
    setSelectedConversation(conversation);
  };

  const onInput = (value: string) => {
    setMessageInput(value);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setSelectedConversation(null);
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,720px)] max-w-6xl flex-col gap-0 overflow-hidden p-0 bg-background/95 backdrop-blur-xl border border-primary/20">
        <VisuallyHidden>
          <DialogTitle>Conversas</DialogTitle>
        </VisuallyHidden>
        {Components.ChatModalHeader}
        <div className="flex min-h-0 flex-1 h-[min(70dvh,560px)] sm:h-[min(70vh,600px)]">
          {/* Conversations List */}
          <div
            className={cn(
              "flex w-full flex-col border-border/50 md:w-1/3 md:border-r",
              selectedConversation ? "hidden md:flex" : "flex"
            )}
          >
            <Tabs defaultValue="private" className="flex h-full flex-col">
              {Components.ChatTabs}
              {Components.SearchBar}

              <TabsContent value="private" className="mt-0 flex-1 overflow-hidden p-0">
                <ScrollArea className="h-[calc(100%_-_120px)]">
                  <Conversations
                    conversations={conversations}
                    onSelectConversation={onSelectConversation}
                    selectedConversation={selectedConversation}
                    type="private"
                    notFoundMessage="Nenhuma conversa encontrada."
                    fallbackAvatar={Components.NoImageProfile}
                  />
                </ScrollArea>
              </TabsContent>

              {/* <TabsContent value="clan" className="mt-0 flex-1 overflow-hidden">
                <ScrollArea className="h-[calc(100%_-_120px)]">
                  <Conversations
                    conversations={conversations}
                    onSelectConversation={onSelectConversation}
                    selectedConversation={selectedConversation}
                    type="clan"
                    notFoundMessage="Nenhum clan encontrado."
                    fallbackAvatar={Components.NoImageClan}
                  />
                </ScrollArea>
              </TabsContent> */}

              <TabsContent value="group" className="mt-0 flex-1 overflow-hidden">
                <Conversations
                  conversations={conversations}
                  onSelectConversation={onSelectConversation}
                  selectedConversation={selectedConversation}
                  type="group"
                  notFoundMessage="Nenhum grupo encontrado."
                  fallbackAvatar={Components.NoImageGroup}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Chat Area */}
          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col",
              selectedConversation ? "flex" : "hidden md:flex"
            )}
          >
            {selectedConversation ? (
              <>
                <ChatHeader
                  selectedConversation={selectedConversation}
                  onBack={() => setSelectedConversation(null)}
                />

                <ScrollArea className="flex-1 p-3 pt-2 sm:p-4 sm:pt-2">
                  <ChatMessages messages={mockMessages} />
                </ScrollArea>

                <InputMessage onInput={onInput} messageInput={messageInput} />
              </>
            ) : (
              Components.NoConversationSelected
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
