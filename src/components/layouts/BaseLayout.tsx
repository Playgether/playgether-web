import React from "react";

import AsideBase from "./AsideBase";
import Megafone from "./Megafone/Megafone";
import HeaderBase from "./HeaderBase";
import { twMerge } from "tailwind-merge";
import { ResponsiveMegafone } from "./Megafone/ResponsiveMegafone";

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
          "flex flex-row w-full flex-grow h-full max-w-screen mt-2 gap-0 justify-center",
          rest.className
        )}
      >
        <div className="sticky top-16 h-[calc(100vh-160px)] z-10 max-w-screen mr-2">
          <AsideBase />
        </div>
        {children}
      </div>

      {/* Chat fixado na parte inferior */}
      <div className="hidden lg:flex sticky z-10 bottom-0 max-w-screen w-full">
        <Megafone />
      </div>
    </div>
  );
};

export default BaseLayout;
