import React from "react";
import HeaderChat from "./HeaderChat";
import SearchChat from "./SearchChat";
import ChatConversations from "./ChatConversations";

function LeftChat() {
  return (
    <div className="w-80 flex flex-col border-r LeftChat-wrapper min-h-0">
      <HeaderChat />
      <SearchChat />
      <ChatConversations />

      {/* Stories */}
      {/* <div className="px-4 py-2 bg-[#5647b0] flex-shrink-0">
        <div className="flex items-center space-x-4 py-2 overflow-x-auto">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="h-14 w-14 bg-[#3d2380] rounded-full flex items-center justify-center">
                <span className="text-2xl">+</span>
              </div>
            </div>
            <span className="text-xs mt-1">Seu Story</span>
          </div>
          {["Anna", "Jeff", "Cathy"].map((name, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="relative">
                <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-[#e83c76]">
                  <img
                    src={`https://randomuser.me/api/portraits/${
                      idx % 2 === 0 ? "women" : "men"
                    }/${idx + 1}.jpg`}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#5647b0]"></div>
              </div>
              <span className="text-xs mt-1">{name}</span>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}

export default LeftChat;
