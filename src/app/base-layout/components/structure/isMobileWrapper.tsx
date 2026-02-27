"use client";

import { useIsMobile } from "@/context/MobileContext";
import React, { useState } from "react";

type ButtonProps = {
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: any;
};

type Props = {
  gamerSidebar: React.ReactNode;
  button: React.ReactElement<ButtonProps>;
};

function IsMobileWrapper({ gamerSidebar, button }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  const mergedButton = isMobile
    ? React.cloneElement(button, {
        onClick: (e: React.MouseEvent) => {
          button.props.onClick?.(e);
          openSidebar();
        },
      })
    : button;

  return (
    <>
      {isMobile && mergedButton}
      {!isMobile && gamerSidebar}

      {isMobile && sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeSidebar}
          />
          <div
            className={`fixed left-0 top-0 h-full w-20 bg-gradient-primary z-50 transform transition-transform duration-300 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {gamerSidebar}
          </div>
        </>
      )}
    </>
  );
}

export default IsMobileWrapper;