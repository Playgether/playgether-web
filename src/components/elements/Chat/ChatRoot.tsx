import React from "react";

function ChatRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full max-h-[calc(100vh-160px)] w-full text-white mt-2">
      {children}
    </div>
  );
}

export default ChatRoot;
