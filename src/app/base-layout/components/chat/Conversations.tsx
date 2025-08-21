import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConversationsProps } from "../../types/chat/ChatsInterface";
import NoConversationsFound from "./NoConversationsFound";

function Conversations({
  conversations,
  selectedConversation,
  onSelectConversation,
  type,
  notFoundMessage,
  fallbackAvatar,
}: ConversationsProps) {
  return (
    <>
      {conversations.filter((c) => c.type === type).length === 0 ? (
        <NoConversationsFound message={notFoundMessage} />
      ) : (
        conversations
          .filter((c) => c.type === type)
          .map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`p-4 cursor-pointer hover:bg-muted/20 transition-colors border-l-2 ${
                selectedConversation?.id === conversation.id
                  ? "border-primary bg-primary/10"
                  : "border-transparent"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    {conversation.avatar === "" ? (
                      fallbackAvatar
                    ) : (
                      <AvatarImage
                        src={conversation.avatar}
                        alt={conversation.name}
                      />
                    )}
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 status-online rounded-full border-2 border-background"></div>
                </div>
                <div className="flex-1 flex justify-between items-center min-w-0">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">
                        {conversation.name}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground mr-1">
                    {conversation.timestamp}
                  </span>
                </div>
                {conversation.unread && (
                  <div className="w-6 h-6 bg-gradient-secondary rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {conversation.unread}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
      )}
    </>
  );
}

export default Conversations;
