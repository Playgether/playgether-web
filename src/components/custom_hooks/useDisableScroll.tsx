"use client";
import React, { useEffect } from "react";

export default function useDisableScroll() {
  useEffect(() => {
    const disableScrollAndEvents = (e: Event) => e.stopPropagation(); // Impede propagação para o fundo
    const preventScroll = () => (document.body.style.overflow = "hidden");

    preventScroll();
    const backdrop = document.querySelector(".backdrop");
    backdrop?.addEventListener("scroll", disableScrollAndEvents, {
      passive: false,
    });
    backdrop?.addEventListener("click", disableScrollAndEvents);

    return () => {
      document.body.style.overflow = "auto";
      backdrop?.removeEventListener("scroll", disableScrollAndEvents);
      backdrop?.removeEventListener("click", disableScrollAndEvents);
    };
  }, []);
  return <div>useDisableScroll</div>;
}
