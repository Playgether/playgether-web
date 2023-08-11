import React from "react";

import AsideBase from "./AsideBase"
import GlobalChat from "./GlobalChat"
import HeaderBase from "./HeaderBase"
import { twMerge } from "tailwind-merge";


const BaseLayout = ({children, ...rest}) => {
    return (
        <div className={twMerge('h-screen w-screen bg-white-200 bg-opacity-85 flex flex-col overflow-x-hidden', rest.className)}>
            <div>
                <HeaderBase />
            </div>
            <div className="flex flex-row h-5/6 w-full items-center justify-center">
                <AsideBase />
                {children}
            </div>    
            <div>
                <GlobalChat />
            </div>
        </div>
      )
  }

export default BaseLayout;


