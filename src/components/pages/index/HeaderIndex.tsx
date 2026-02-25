import React from "react";

interface HeaderIndexProps {
  onClickLogo: () => void;
  onClickSobre: () => void;
}

const HeaderIndex = ({ onClickLogo, onClickSobre }: HeaderIndexProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-transparent">
      <button
        type="button"
        onClick={onClickLogo}
        className="flex items-center gap-2"
        aria-label="Ir para início"
      >
        <div className="flex items-center -space-x-2">
          <div className="w-10 h-10 rounded-full bg-secondary opacity-90" />
          <div className="w-10 h-10 rounded-full bg-neon-blue opacity-90" />
        </div>
      </button>

      <button
        type="button"
        onClick={onClickSobre}
        className="text-foreground text-lg font-semibold tracking-widest uppercase hover:text-neon-blue transition-colors duration-300"
      >
        SOBRE
      </button>
    </nav>
  );
};

export default HeaderIndex;
