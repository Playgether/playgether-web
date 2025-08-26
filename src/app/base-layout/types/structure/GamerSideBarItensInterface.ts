import { LucideIcon } from "lucide-react";

export interface GamerSideBarItensInterface {
  // icon: LucideIcon;
  icon: JSX.Element;
  label: string;
  active?: boolean;
  notifications?: number;
}
