import { Home, Users, Search, Settings, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameNavProps {
  currentStep: string;
  onStepChange: (step: string) => void;
}

const navItems = [
  { id: "profile", icon: Home, label: "Profile" },
  { id: "roles", icon: Users, label: "Roles" },
  { id: "filter", icon: Search, label: "Filter" },
  { id: "results", icon: Trophy, label: "Results" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export const GameNav = ({ currentStep, onStepChange }: GameNavProps) => {
  return (
    <nav className="fixed left-0 top-0 h-full w-20 bg-background-secondary/80 backdrop-blur-xl border-r border-border-bright/20 z-50">
      <div className="flex flex-col items-center py-8 h-full">
        {/* Logo */}
        <div className="mb-12">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary">
            <Trophy className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col space-y-6 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentStep === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onStepChange(item.id)}
                className={cn(
                  "relative group w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                  "hover:bg-primary/10 hover:shadow-glow-primary",
                  isActive
                    ? "bg-primary/20 shadow-glow-primary text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className="w-5 h-5" />
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full shadow-glow-primary" />
                )}
                
                {/* Tooltip */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-card-secondary/90 backdrop-blur-sm text-card-foreground px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-border/30">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* User Avatar */}
        <div className="mt-auto">
          <div className="w-10 h-10 bg-gradient-secondary rounded-full border-2 border-secondary/30 shadow-glow-secondary" />
        </div>
      </div>
    </nav>
  );
};