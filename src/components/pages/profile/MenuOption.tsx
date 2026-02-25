import React from "react";

const MenuOption = ({
  text,
  label,
  Icon,
  setContent,
  content,
}: {
  text: string;
  label?: string;
  Icon?: React.ComponentType<{ className?: string }>;
  setContent: (content: string) => void;
  content: string;
}) => {
  const isActive = content === text;
  return (
    <li>
      <button
        type="button"
        onClick={() => setContent(text)}
        aria-pressed={isActive}
        className={[
          "flex flex-col items-center gap-1 p-3 min-w-[80px] h-auto rounded-lg transition-all duration-200",
          isActive
            ? "bg-gradient-primary text-white shadow-neon"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        ].join(" ")}
      >
        {Icon ? <Icon className="h-4 w-4 flex-shrink-0" /> : null}
        <span className="text-xs whitespace-nowrap capitalize">
          {label || text}
        </span>
      </button>
    </li>
  );
};

export default MenuOption;
