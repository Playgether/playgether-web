"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const MobileContext = createContext(false);

export function MobileProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <MobileContext.Provider value={isMobile}>
      {children}
    </MobileContext.Provider>
  );
}

export function useIsMobile() {
  return useContext(MobileContext);
}