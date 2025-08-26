import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettingSections } from "./hooks/useSettingsSections";
import { useBaseLayoutServerContext } from "./context/BaseLayoutServerContext";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { settingSections } = useSettingSections();
  const { BaseLayout } = useBaseLayoutServerContext();
  const components = BaseLayout?.ServerSettingsModal?.components;
  const SettingsHeader = components?.SettingsHeader;
  const Separator = components?.Separator;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl border border-primary/20 shadow-glow-primary">
        {SettingsHeader}
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

              {sectionIndex < settingSections.length - 1 && Separator}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
