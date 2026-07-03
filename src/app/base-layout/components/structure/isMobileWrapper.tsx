"use client";

import { useIsMobile } from "@/context/MobileContext";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, sidebarOpen]);

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
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeSidebar}
            aria-hidden="true"
          />
          <div
            className={`fixed left-0 top-0 z-50 flex h-full w-[min(85vw,14rem)] transform flex-col bg-gradient-primary shadow-2xl transition-transform duration-300 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <button
              type="button"
              onClick={closeSidebar}
              className="absolute right-2 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4" />
            </button>
            {gamerSidebar}
          </div>
        </>
      )}
    </>
  );
}

export default IsMobileWrapper;
