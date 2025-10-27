import { useState } from "react";
import { Button } from "@/components/ui/button";
import { roles } from "../../constants/roles";

interface RoleSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export const RoleSelection = ({ onNext, onBack }: RoleSelectionProps) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-6">
      <div className="w-full max-w-5xl animate-slide-in-up">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-card-foreground mb-4">
            Escolha suas rotas desejadas
          </h1>
          <p className="text-muted-foreground text-lg">
            Selecione as rotas que você deseja procurar
          </p>
        </div>

        {/* Role Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {roles.map((role, index) => {
            const IconComponent = role.icon;
            const isSelected = selectedRoles.includes(role.id);
            
            return (
              <div
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className={`
                  card-glass rounded-xl p-6 cursor-pointer transition-all duration-300 animate-fade-in-scale
                  ${isSelected 
                    ? 'border-primary shadow-glow-primary bg-primary/10' 
                    : 'hover:border-primary/50 hover:shadow-glow-primary/50'
                  }
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-center space-y-4">
                  <div className={`
                    w-16 h-16 mx-auto rounded-xl flex items-center justify-center transition-all duration-300
                    ${isSelected 
                      ? `bg-gradient-${role.color} shadow-glow-${role.color}` 
                      : 'bg-muted/50'
                    }
                  `}>
                    <IconComponent className={`w-8 h-8 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  
                  <div>
                    <h3 className={`font-bold text-lg mb-1 ${isSelected ? 'text-primary' : 'text-card-foreground'}`}>
                      {role.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-glow-primary">
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6">
          <Button
            variant="outline"
            className="px-8 py-3 text-muted-foreground border-border hover:border-primary/50 hover:text-primary transition-all duration-300"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={selectedRoles.length === 0}
            className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground px-12 py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continar ( {selectedRoles.length} selecionado(s) )
          </Button>
        </div>
      </div>
    </div>
  );
};