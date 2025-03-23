import React from "react";
import RightChatMessageContainer from "./RightChatMessageContainer";
import RightChatMineMessage from "./RightChatMineMessage";

function RightChatMessages() {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
      <RightChatMessageContainer
        image="https://randomuser.me/api/portraits/women/8.jpg"
        message="Ei! Como você está?"
        hour={"11:30"}
      />
      <RightChatMessageContainer
        image="https://randomuser.me/api/portraits/women/8.jpg"
        message="Vamos fazer trilha neste fim de semana?"
        hour={"11:30"}
      />

      <RightChatMessageContainer
        image="https://randomuser.me/api/portraits/women/8.jpg"
        message="Vamos fazer trilha neste fim de semana?"
        hour={"11:32"}
      />

      <RightChatMessageContainer
        image="https://randomuser.me/api/portraits/women/8.jpg"
        message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Volutpat lacus laoreet non curabitur gravida."
        hour={"Sex 15:04"}
      />

      <RightChatMineMessage message="Ei! Como você está?" hour="11:35" />

      <RightChatMineMessage
        message="Vamos fazer trilha neste fim de semana?"
        hour="11:36"
      />

      <RightChatMineMessage
        message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Volutpat lacus laoreet non curabitur gravida."
        hour="Sáb 14:10"
      />

      <RightChatMessageContainer
        image="https://randomuser.me/api/portraits/women/8.jpg"
        message="Ei! Como você está?"
        hour={"12:40"}
      />

      <RightChatMineMessage message="Ei! Como você está?" hour="Agora" />
    </div>
  );
}

export default RightChatMessages;
