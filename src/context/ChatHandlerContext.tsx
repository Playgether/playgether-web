"use client";

import { ChatRoomMessages } from "@/types/ChatRoomMessages";
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  MutableRefObject,
} from "react";
import useWebSocket from "react-use-websocket";
import { useAuthContext } from "./AuthContext";
import { ChatRoom } from "@/types/ChatRoom";

type ChatHandlerContextProps = {
  newMessage: string;
  setNewMessage: (message: string) => void;
  realTimeMessages: ChatRoomMessages[];
  handleRealTimeMessages: (messages: ChatRoomMessages[]) => void;
  sendMessage: () => void;
  messagesDiv: MutableRefObject<HTMLDivElement | null>;
  messagesQuantity: number;
  resetMessagesQuantity: () => void;
  shouldScrollToBottom: boolean;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  executeScrollBottom: () => void;
  newMessageId: number;
};

const ChatHandlerContext = createContext<ChatHandlerContextProps>(
  {} as ChatHandlerContextProps
);

const ChatHandlerContextProvider = ({
  token,
  chatroom,
  children,
}: {
  token: string;
  chatroom: string;
  children: React.ReactNode;
}) => {
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `ws://192.168.18.8:8000/ws/chatroom/${chatroom}?token=${token}`,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );

  const [messagesQuantity, setMessagesQuanity] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [realTimeMessages, setRealTimeMessages] = useState<ChatRoomMessages[]>(
    []
  );
  const messagesDiv = useRef<HTMLDivElement>(null);
  const { user } = useAuthContext();
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [newMessageId, setNewMessageId] = useState(0);
  const [newMessageObject, setNewMessageObject] = useState<ChatRoom | {}>({});

  const handleRealTimeMessages = (messages: []) => {
    setRealTimeMessages(messages);
  };

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) {
      setShouldScrollToBottom(true);
      resetMessagesQuantity();
      setNewMessageId(0);
      setNewMessageObject({});
    } else {
      setShouldScrollToBottom(false);
    }
  };

  const executeScrollBottom = () => {
    setShouldScrollToBottom(true);
    setTimeout(() => setShouldScrollToBottom(false), 100);
    setNewMessageId(0);
  };

  const resetMessagesQuantity = () => {
    setMessagesQuanity(0);
  };

  // Efeito para atualizar mensagens recebidas
  useEffect(() => {
    if (lastJsonMessage && typeof lastJsonMessage === "object") {
      const message = lastJsonMessage as ChatRoomMessages;

      setRealTimeMessages((prevMessages) => [...prevMessages, message]);
      if (message.author_username !== user?.username) {
        if (shouldScrollToBottom) {
          setShouldScrollToBottom(false);
          setTimeout(() => setShouldScrollToBottom(true), 0);
        } else {
          setMessagesQuanity((prevQuanity) => prevQuanity + 1);
          setNewMessageObject(message);
        }
      } else {
        setShouldScrollToBottom(false);
        setTimeout(() => setShouldScrollToBottom(true), 0);
      }
    }
  }, [lastJsonMessage]);

  // Função para enviar mensagem
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    sendJsonMessage({
      event: "message_handler",
      body: newMessage,
    });
    setNewMessage("");
  };

  useEffect(() => {
    if (messagesQuantity === 1) {
      if (
        typeof newMessageObject === "object" &&
        "id" in newMessageObject &&
        Object.keys(newMessageObject).length > 0
      ) {
        setNewMessageId(newMessageObject.id);
      }
    }
  }, [messagesQuantity]);

  return (
    <ChatHandlerContext.Provider
      value={{
        newMessage,
        setNewMessage,
        realTimeMessages,
        handleRealTimeMessages,
        sendMessage,
        messagesDiv,
        messagesQuantity,
        resetMessagesQuantity,
        shouldScrollToBottom,
        handleScroll,
        executeScrollBottom,
        newMessageId,
      }}
    >
      {children}
    </ChatHandlerContext.Provider>
  );
};

const useChatHandlerContext = () => {
  const context = useContext(ChatHandlerContext);
  return context;
};

export {
  ChatHandlerContextProvider,
  useChatHandlerContext,
  ChatHandlerContext,
};
