import React from "react";
import { BrandLogo } from "@/components/general/BrandLogo";
import { cn } from "@/lib/utils";

interface HeaderIndexProps {
  onClickLogo: () => void;
  onClickSobre: () => void;
  isSobreOpen?: boolean;
}

const HeaderIndex = ({ onClickLogo, onClickSobre, isSobreOpen = false }: HeaderIndexProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-transparent">
      <button
        type="button"
        onClick={onClickLogo}
        className="flex items-center gap-2"
        aria-label="Ir para início"
      >
        <BrandLogo variant="icon" className="h-10 w-10" priority />
      </button>

      <button
        type="button"
        onClick={onClickSobre}
        className={cn(
          "text-lg font-semibold tracking-widest uppercase hover:text-neon-blue transition-colors duration-300 dark:text-foreground dark:[text-shadow:none]",
          isSobreOpen ? "text-foreground" : "text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]"
        )}
      >
        SOBRE
      </button>
    </nav>
  );
};

export default HeaderIndex;
