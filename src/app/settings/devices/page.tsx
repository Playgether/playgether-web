"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsPageWrapper, SettingsSection } from "../components/SettingsPageWrapper";

export default function DevicesSettingsPage() {
  return (
    <SettingsPageWrapper
      title="Dispositivos"
      description="Gerencie os dispositivos e sessões ativas da sua conta."
    >
      <SettingsSection
        title="Sessões ativas"
        description="Dispositivos onde sua conta PlayGether está conectada."
      >
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Navegador Web</p>
              <p className="text-xs text-muted-foreground">Sessão atual · Ativa agora</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
            Atual
          </span>
        </div>

        <p className="text-xs text-muted-foreground px-1 pt-1">
          O gerenciamento completo de sessões e dispositivos estará disponível em breve.
        </p>
      </SettingsSection>

      <SettingsSection
        title="Notificações push"
        description="Dispositivos configurados para receber notificações."
      >
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex gap-3 text-muted-foreground/30">
            <Smartphone className="w-8 h-8" />
            <Tablet className="w-8 h-8" />
          </div>
          <p className="text-sm text-muted-foreground">
            Nenhum dispositivo móvel registrado ainda.
          </p>
          <Button variant="outline" size="sm" disabled className="text-xs rounded-lg mt-1">
            Em breve
          </Button>
        </div>
      </SettingsSection>
    </SettingsPageWrapper>
  );
}
