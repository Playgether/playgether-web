"use client";
import DefaultButton from "@/components/elements/DefaultButton/DefaultButton";
import { useAuthContext } from "@/context/AuthContext";
import {
  buildAuthenticatedWebSocketUrl,
  requestWebSocketTicket,
} from "@/lib/websocketAuth";
import React, { useEffect, useState, useRef } from "react";
import useWebSocket from "react-use-websocket";

function Component({ chatroom }: { chatroom: string }) {
  const socketPath = `/ws/chatroom/${encodeURIComponent(chatroom)}`;
  const [socketUrl, setSocketUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    requestWebSocketTicket(socketPath)
      .then(({ ticket }) => {
        if (!cancelled) {
          setSocketUrl(buildAuthenticatedWebSocketUrl(socketPath, ticket));
        }
      })
      .catch(() => {
        if (!cancelled) setSocketUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [socketPath]);

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    socketUrl,
    {
      share: false,
      shouldReconnect: () => false,
    },
  );

  const { user } = useAuthContext();
  const [newMessage, setNewMessage] = useState("");
  const [realTimeMessages, setRealTimeMessages] = useState<
    { author: string; body: string }[]
  >([]);
  const messagesDiv = useRef<HTMLDivElement>(null);

  // Função para rolar automaticamente até o final das mensagens
  const scrollToBottom = () => {
    if (messagesDiv.current) {
      messagesDiv.current.scrollTop = messagesDiv.current.scrollHeight;
    }
  };

  // Efeito para atualizar mensagens recebidas
  useEffect(() => {
    console.log(lastJsonMessage);
    if (
      lastJsonMessage &&
      typeof lastJsonMessage === "object" &&
      "author" in lastJsonMessage &&
      "body" in lastJsonMessage
    ) {
      const message = {
        author: String(lastJsonMessage.author),
        body: String(lastJsonMessage.body),
      };
      setRealTimeMessages((prevMessages) => [...prevMessages, message]);
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
    <div ref={messagesDiv} className="text-black-200">
      <h1>Chat {chatroom}</h1>
      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        {realTimeMessages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.author}:</strong> {msg.body}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Digite sua mensagem..."
      />
      <DefaultButton onClick={sendMessage}>Enviar</DefaultButton>
    </div>
  );
}

export default Component;
