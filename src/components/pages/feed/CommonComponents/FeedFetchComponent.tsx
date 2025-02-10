'use client'

import { useEffect, useState } from "react";
import ContentFeed from "../DesktopFeed/MultUseComponents/ContentFeed"
import ResponsiveFeedContainer from "../ResponsiveFeed/ResponsiveFeedContainer";

export const FeedFetchComponent = () => {
    const [isDesktop, setIsDesktop] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsDesktop(width >= 1224);
            setIsMobile(width <= 768);
        };

        // Verificar o tamanho da tela ao montar o componente
        handleResize();

        // Adicionar um listener para o evento de resize
        window.addEventListener('resize', handleResize);

        // Remover o listener ao desmontar o componente
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {isDesktop ? (
                <div className='hidden lg:flex flex-col h-full w-full overflow-visible'>
                    <ContentFeed />
                </div> 
            ): isMobile ? (
                <div className='lg:hidden h-full w-full'>
                    <ResponsiveFeedContainer />
                </div> 
            ): (
                undefined
            )}
        </>
    )
}