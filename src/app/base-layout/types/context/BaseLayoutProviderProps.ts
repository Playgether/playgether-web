import { ReactElement, ReactNode } from "react";

export type ProviderProps = {
  children: ReactNode;
  components: Record<string, ReactElement>;
};
