import { ChatRoom } from "@/types/ChatRoom";
import React from "react";

function RightChatRoomInformations({ room }: { room: ChatRoom }) {
  return (
    <div className="flex w-full h-full p-10 justify-center">
      <div className="space-y-20 w-1/2 flex flex-col border-r-2  pl-8">
        <span className="text-4xl text-center">Informações</span>
        <div className="space-y-5">
          <p>Criada em: {room.created_at_formated}</p>
          <p>
            Criada por: {room.owner_fullname} ({room.owner_username})
          </p>
          <p>Mensagens totais enviadas: {room.total_messages}</p>
          <p>Comporta: Máximo de {room.capacity} usuários</p>
          <p>Maior pico de usuários: {room.peak_users} usuários</p>
        </div>
      </div>
      <div className="space-y-20 w-1/2 flex flex-col  pl-10">
        <span className="text-4xl text-center">Regras</span>
        <div className="space-y-5">
          {room.rules.map((rule) => (
            <p key={rule.id}>{rule.description}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RightChatRoomInformations;
