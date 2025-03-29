"use client";
import { useRef } from "react";

function useScrollToBottom(resetFunction?: () => void) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (
    target?: React.RefObject<HTMLDivElement> | string
  ) => {
    let scrollTarget: HTMLElement | null = null;

    if (typeof target === "string") {
      // Se for um ID, busca o elemento pelo ID
      scrollTarget = document.getElementById(target) ?? null;

      // Se for uma classe, pega o primeiro elemento correspondente
      if (!scrollTarget) {
        const elements = document.getElementsByClassName(target);
        if (elements.length > 0) {
          scrollTarget = elements[0] as HTMLElement;
        }
      }
    } else if (target?.current) {
      scrollTarget = target.current;
    } else {
      scrollTarget = endOfMessagesRef.current;
    }

    scrollTarget?.scrollIntoView({ behavior: "smooth" });

    if (resetFunction) {
      resetFunction();
    }
  };

  return { endOfMessagesRef, scrollToBottom };
}

export default useScrollToBottom;
