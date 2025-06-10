"use client";

import { FeedProps } from "@/types/FeedProps";
import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

interface MiddleFeedContextProps {
  openPostsExtend: boolean;
  resourceObject: FeedProps | undefined;
  slideIndex: number;
  saveSlideIndexOnOpen: number;
  setSlideIndex: (slideIndex: number) => void;
  handlePostsCloseExtend: () => void;
  handlePostsExtend: (resourceObject: FeedProps) => void;
}

export const MiddleFeedContext = createContext({} as MiddleFeedContextProps);

export const MiddleFeedContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [openPostsExtend, setOpenPostsExtend] = useState(false);
  const [resourceObject, setResourceObject] = useState<FeedProps | undefined>();
  const [slideIndex, setSlideIndex] = useState(0);
  const [saveSlideIndexOnOpen, setSaveSlideIndexOnOpen] = useState(0);

  const router = useRouter();

  const handlePostsCloseExtend = () => {
    setOpenPostsExtend(!openPostsExtend);
    setSlideIndex(saveSlideIndexOnOpen);
    history.pushState(null, "", `/feed`);
  };

  const handlePostsExtend = (resourceObject) => {
    setResourceObject(resourceObject);
    setOpenPostsExtend(!openPostsExtend);
    setSaveSlideIndexOnOpen(slideIndex);
    history.pushState(null, "", `/post/${resourceObject.id}`);
  };

  return (
    <MiddleFeedContext.Provider
      value={{
        openPostsExtend,
        resourceObject,
        slideIndex,
        saveSlideIndexOnOpen,
        setSlideIndex,
        handlePostsCloseExtend,
        handlePostsExtend,
      }}
    >
      {children}
    </MiddleFeedContext.Provider>
  );
};

export const useMiddleFeedContext = () => useContext(MiddleFeedContext);
