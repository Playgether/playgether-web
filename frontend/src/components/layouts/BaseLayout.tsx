import React from "react";

import AsideBase from "./AsideBase"
import GlobalChat from "./GlobalChat"
import HeaderBase from "./HeaderBase"
import { twMerge } from "tailwind-merge";
import { ResponsiveGlobalChat } from "./ResponsiveGlobalChat";


const BaseLayout = ({children, ...rest}) => {
    return (
        <div className={twMerge('h-screen w-screen bg-white-200 bg-opacity-85 flex flex-col overflow-x-hidden gap-3 overflow-y-hidden max-h-screen relative', rest.className)}>
            <HeaderBase />

            <div className="flex flex-row w-full items-center justify-center h-4/6 flex-grow shrink-0">
                <AsideBase />
                {children}
            </div>   
            <div className="hidden lg:flex">
                <GlobalChat />
            </div>

            <div className="lg:hidden">
                <ResponsiveGlobalChat />
            </div>
        </div>
      )
  }

export default BaseLayout;


