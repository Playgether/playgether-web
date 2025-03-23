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

type ChatHandlerContextProps = {
  newMessage: string;
  setNewMessage: (message: string) => void;
  realTimeMessages: ChatRoomMessages[];
  newMessages: ChatRoomMessages[];
  handleRealTimeMessages: (messages: ChatRoomMessages[]) => void;
  sendMessage: () => void;
  messagesDiv: MutableRefObject<null | string>;
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

  const [newMessages, setNewMessages] = useState<ChatRoomMessages[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [realTimeMessages, setRealTimeMessages] = useState<ChatRoomMessages[]>(
    []
  );
  const messagesDiv = useRef(null);
  const { user } = useAuthContext();

  const handleRealTimeMessages = (messages: []) => {
    setRealTimeMessages(messages);
  };
  // Função para rolar automaticamente até o final das mensagens
  const scrollToBottom = () => {
    if (messagesDiv.current) {
      messagesDiv.current.scrollTop = messagesDiv.current.scrollHeight;
    }
  };

  // Efeito para atualizar mensagens recebidas
  useEffect(() => {
    if (lastJsonMessage && typeof lastJsonMessage === "object") {
      const message = lastJsonMessage as ChatRoomMessages;

      setRealTimeMessages((prevMessages) => [...prevMessages, message]);
      if (message.author_username !== user?.username)
        setNewMessages((prevMessages) => [...prevMessages, message]);
    }
    scrollToBottom();
  }, [lastJsonMessage]);

  // Função para enviar mensagem
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    sendJsonMessage({
      event: "message_handler",
      body: newMessage,
    });

    setNewMessage("");
    setTimeout(scrollToBottom, 50);
  };

  return (
    <ChatHandlerContext.Provider
      value={{
        newMessage,
        setNewMessage,
        realTimeMessages,
        handleRealTimeMessages,
        sendMessage,
        messagesDiv,
        newMessages,
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
