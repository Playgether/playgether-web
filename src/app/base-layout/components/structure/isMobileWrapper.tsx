"use client";

import { useIsMobile } from "@/context/MobileContext";
import React, { useState } from "react";

type Props = {
  gamerSidebar: React.ReactNode;
  button: React.ReactNode;
};

function IsMobileWrapper({ gamerSidebar, button }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  // Merge openSidebar with button's onClick
  const mergedButton =
    isMobile && React.isValidElement(button)
      ? React.cloneElement(button, {
          onClick: (e: React.MouseEvent) => {
            if (button.props.onClick) button.props.onClick(e);
            openSidebar();
          },
        })
      : button;

  return (
    <>
      {isMobile && mergedButton}

      {/* Desktop Sidebar */}
      {!isMobile && gamerSidebar}

      {/* Mobile Sidebar Overlay */}
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
