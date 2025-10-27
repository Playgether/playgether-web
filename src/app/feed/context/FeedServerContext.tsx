"use client";
import { createContext, useContext, ReactNode } from "react";

type ComponentsMap =
  typeof import("./FeedServerComponentsProvider").FeedServerComponents;

const FeedServerContext = createContext<ComponentsMap | null>(null);

export function useFeedServerContext() {
  const context = useContext(FeedServerContext);
  if (!context) {
    throw new Error(
      "useFeedServerContext deve ser usado dentro de FeedServerProvider"
    );
  }
  return { Feed: context };
}

interface ProviderProps {
  children: ReactNode;
  components: ComponentsMap;
}

export function FeedServerProvider({ children, components }: ProviderProps) {
  return (
    <FeedServerContext.Provider value={components}>
      {children}
    </FeedServerContext.Provider>
  );
}
