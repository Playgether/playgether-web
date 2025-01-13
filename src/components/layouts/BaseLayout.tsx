import React from "react";

import AsideBase from "./AsideBase";
import GlobalChat from "./Megafone/GlobalChat";
import HeaderBase from "./HeaderBase";
import { twMerge } from "tailwind-merge";
import { ResponsiveGlobalChat } from "./Megafone/ResponsiveGlobalChat";

const BaseLayout = ({ children, ...rest }) => {
  return (
    <div className="h-fit flex flex-col max-w-screen BaseLayout-wrapper">
      {/* Header fixado no topo */}
      <div className="sticky top-0 z-10 min-w-screen">
        <HeaderBase />
      </div>

      {/* Corpo principal */}
      <div
        className={twMerge(
          "flex flex-row w-full flex-grow max-w-screen mt-2",
          rest.className
        )}
      >
        <div className="sticky top-16 h-[calc(100vh-160px)] z-10 max-w-screen">
          <AsideBase />
        </div>
        {children}
      </div>

      {/* Chat fixado na parte inferior */}
      <div className="hidden lg:flex sticky z-10 bottom-0 max-w-screen w-full">
        <GlobalChat />
      </div>
      <div className="lg:hidden sticky bottom-0 max-w-screen">
        <ResponsiveGlobalChat />
      </div>
    </div>
  );
};

export default BaseLayout;
