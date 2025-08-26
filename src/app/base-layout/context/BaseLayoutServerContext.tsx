"use client";
import { createContext, useContext, ReactNode } from "react";

// O tipo é inferido do objeto exportado
type ComponentsMap =
  typeof import("./BaseLayoutProvider").BaseLayoutServerComponents;

const BaseLayoutServerContext = createContext<ComponentsMap | null>(null);

export function useBaseLayoutServerContext() {
  const context = useContext(BaseLayoutServerContext);
  if (!context) {
    throw new Error(
      "useBaseLayoutServerContext deve ser usado dentro de BaseLayoutServerProvider"
    );
  }
  // Namespaced para evitar conflitos e facilitar autocomplete
  return { BaseLayout: context };
}

interface ProviderProps {
  children: ReactNode;
  components: ComponentsMap;
}

export function BaseLayoutServerProvider({
  children,
  components,
}: ProviderProps) {
  return (
    <BaseLayoutServerContext.Provider value={components}>
      {children}
    </BaseLayoutServerContext.Provider>
  );
}
