import { useState } from "react";
import MenuOption from "./MenuOption";

export const MenuProfile = ({
  setContent,
  content,
}: {
  setContent: (content: string) => void;
  content: string;
}) => {
  return (
    <div className="w-full MenuProfile-wrapper rounded-lg h-16">
      <ul className="w-full flex justify-between items-center h-full px-8 font-medium">
        <MenuOption text={"bio"} setContent={setContent} content={content} />
        <MenuOption text={"medias"} setContent={setContent} content={content} />
        <MenuOption text={"textos"} setContent={setContent} content={content} />
        <MenuOption
          text={"estatisticas"}
          setContent={setContent}
          content={content}
        />
        <MenuOption
          text={"conquistas"}
          setContent={setContent}
          content={content}
        />
        <MenuOption text={"marcos"} setContent={setContent} content={content} />
        <MenuOption text={"jogos"} setContent={setContent} content={content} />
      </ul>
    </div>
  );
};
