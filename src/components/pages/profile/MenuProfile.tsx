import { useState } from "react";

export const MenuProfile = ({
  setContent,
  content,
}: {
  setContent: (content: string) => void;
  content: string;
}) => {
  const [animation, setAnimation] = useState("");

  const handleContent = (textContent: string) => {
    setContent(textContent);
  };

  return (
    <div className="w-full MenuProfile-wrapper rounded-lg h-16 shadow shadow-gray-400">
      <ul className="w-full flex justify-between items-center h-full px-8 font-medium">
        <div
          className={`MenuProfile-option h-full flex flex-col items-center justify-center rounded-lg w-20 cursor-pointer 
                ${animation} 
                ${content === "bio" ? "MenuProfile-selected bg-opacity-20" : ""}`}
          onClick={() => handleContent("bio")}
        >
          <li>
            <a>Bio</a>
          </li>
        </div>
        <div
          className={`MenuProfile-option h-full flex flex-col items-center justify-center rounded-lg w-20 cursor-pointer 
                ${animation} 
                ${content === "medias" ? "MenuProfile-selected bg-opacity-30" : ""}`}
          onClick={() => handleContent("medias")}
        >
          <li>
            <a>Medias</a>
          </li>
        </div>
        <div
          className={`MenuProfile-option h-full flex flex-col items-center justify-center rounded-lg w-20 cursor-pointer 
                ${animation} 
                ${content === "textos" ? "MenuProfile-selected bg-opacity-30" : ""}`}
          onClick={() => handleContent("textos")}
        >
          <li>
            <a>Textos</a>
          </li>
        </div>
        <div
          className={`MenuProfile-option h-full flex flex-col items-center justify-center rounded-lg w-28 cursor-pointer 
                ${animation} 
                ${content === "estatisticas" ? "MenuProfile-selected bg-opacity-30" : ""}`}
          onClick={() => handleContent("estatisticas")}
        >
          <li>
            <a>Estatísticas</a>
          </li>
        </div>
        <div
          className={`MenuProfile-option h-full flex flex-col items-center justify-center rounded-lg w-28 cursor-pointer 
                ${animation} 
                ${content === "conquistas" ? "MenuProfile-selected bg-opacity-30" : ""}`}
          onClick={() => handleContent("conquistas")}
        >
          <li>
            <a>Conquistas</a>
          </li>
        </div>
        <div
          className={`MenuProfile-option h-full flex flex-col items-center justify-center rounded-lg w-20 cursor-pointer 
                ${animation} 
                ${content === "marcos" ? "MenuProfile-selected bg-opacity-30" : ""}`}
          onClick={() => handleContent("marcos")}
        >
          <li>
            <a>Marcos</a>
          </li>
        </div>

        <div
          className={`MenuProfile-option h-full flex flex-col items-center justify-center rounded-lg w-20 cursor-pointer 
                ${animation} 
                ${content === "games" ? "MenuProfile-selected bg-opacity-30" : ""}`}
          onClick={() => handleContent("games")}
        >
          <li>
            <a>Jogos</a>
          </li>
        </div>
      </ul>
    </div>
  );
};
