import React from "react";

function HeaderChat() {
  return (
    <div className="p-4 flex items-center justify-between HeaderChat-wrapper border-b  flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 HeaderChat-Icons rounded-full flex items-center justify-center">
          <span className="text-xl">👓</span>
        </div>
        <h1 className="text-lg font-semibold">Mensagens</h1>
      </div>
      <div className="HeaderChat-Icons h-8 w-8 rounded-full flex items-center justify-center">
        <span className="text-xl">✏️</span>
      </div>
    </div>
  );
}

export default HeaderChat;
