"use client";

import { useEffect, useState } from "react";
import ContentFeed from "../DesktopFeed/MultUseComponents/ContentFeed";

export const FeedFetchComponent = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1224);
    };

    // Verificar o tamanho da tela ao montar o componente
    handleResize();

    // Adicionar um listener para o evento de resize
    window.addEventListener("resize", handleResize);

    // Remover o listener ao desmontar o componente
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isDesktop ? (
        <div className="hidden lg:flex flex-col h-full overflow-visible">
          <ContentFeed />
        </div>
      ) : (
        undefined
      )}
    </>
  );
};
