import React from "react";

function ChatRoomPeople() {
  return (
    <div className="overflow-y-auto flex-1 ChatConversations-wrapper min-h-0">
      {[
        {
          name: "Angelina Jolie",
          message: "Ok, vejo você no metrô...",
          time: "Agora",
          online: true,
        },
        {
          name: "Tony Stark",
          message: "Ei, você está aí?",
          time: "10min",
          online: true,
        },
        {
          name: "Scarlett Johansson",
          message: "Você enviou uma foto.",
          time: "1h",
          online: false,
          active: true,
        },
        {
          name: "John Snow",
          message: "Você perdeu uma chamada de John.",
          time: "4h",
          online: false,
        },
        {
          name: "Emma Watson",
          message: "Você enviou um vídeo.",
          time: "11 Fev",
          online: false,
        },
        {
          name: "Sunny Leone",
          message: "Ah, foi incrível...",
          time: "1 Fev",
          online: true,
        },
        {
          name: "Bruce Lee",
          message: "Você é um grande ser humano...",
          time: "23 Jan",
          online: false,
        },
        {
          name: "Grupo TailwindCSS",
          message: "Adam: Versão 2 é...",
          time: "23 Jan",
          isGroup: true,
        },
      ].map((chat, idx) => (
        <div
          key={idx}
          className={`flex items-center p-3 ChatConversations-person cursor-pointer ${
            idx === 2 ? "ChatConversations-person-selected" : ""
          }`}
        >
          <div className="relative mr-3">
            <img
              src={`https://randomuser.me/api/portraits/${
                idx % 2 === 0 ? "women" : "men"
              }/${idx + 5}.jpg`}
              alt={chat.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            {chat.online && (
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ChatConversations-online"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h3 className="font-medium truncate">{chat.name}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatRoomPeople;
