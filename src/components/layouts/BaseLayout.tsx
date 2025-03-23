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
          "flex flex-row flex-grow h-fit w-[99vw] mt-2 gap-0 justify-center min-h-[calc(100vh-128px)]",
          rest.className
        )}
      >
        <div className="sticky top-16 h-[calc(100vh-160px)] z-10 max-w-[100vw] mr-2">
          <AsideBase />
        </div>
        {children}
      </div>

      {/* Chat fixado na parte inferior */}
      <div className="hidden lg:flex sticky z-10 bottom-0 max-w-screen ml-2 max-w-[100vw]">
        <Megafone />
      </div>
    </div>
    // <div className="h-screen max-w-[100vw] flex flex-col items-center overflow-x-hidden">
    //   <div className="w-screen sticky top-0 z-10">
    //     <HeaderBase />
    //   </div>
    //   <div className="flex w-[95vw] h-fit relative justify-center">
    //     <div className="sticky left-0 top-16 h-[calc(100vh-160px)] justify-self-center">
    //       <AsideBase />
    //     </div>

    //     <div className="flex flex-wrap h-full mt-2 mb-[70px] 2xl:mb-0 max-w-[1920px] min-h-[100vh]">
    //       {children}
    //     </div>
    //   </div>
    //   <div className="w-screen sticky bottom-0 z-10">
    //     <Megafone />
    //   </div>
    // </div>
  );
};

export default BaseLayout;
