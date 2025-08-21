import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import { useSettingSections } from "./hooks/useSettingsSections";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { settingSections } = useSettingSections();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl border border-primary/20 shadow-glow-primary">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span>Configurações</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-96 overflow-y-auto">
          {settingSections.map((section, sectionIndex) => (
            <div
              key={section.title}
              className="animate-slide-up"
              style={{ animationDelay: `${sectionIndex * 100}ms` }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-primary rounded-md flex items-center justify-center text-white">
                  {section.icon}
                </div>
                <h3 className="font-semibold text-foreground">
                  {section.title}
                </h3>
              </div>

              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-all duration-300"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground">
                        {item.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </div>
                    </div>
                    <div className="ml-4">{item.component}</div>
                  </div>
                ))}
              </div>

              {sectionIndex < settingSections.length - 1 && (
                <Separator className="mt-6 bg-border/50" />
              )}
            </div>
          ))}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
              onClick={() => {
                // TODO: Implement save functionality
                onOpenChange(false);
              }}
            >
              Salvar
            </Button>
          </div>{" "}
        </div>
      </DialogContent>
    </Dialog>
  );
};
