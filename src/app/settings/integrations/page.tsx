"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { SettingsPageWrapper, SettingsSection } from "../components/SettingsPageWrapper";

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: string;
}

function IntegrationCard({ name, description, icon }: IntegrationCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" disabled className="text-xs rounded-lg">
        Em breve
      </Button>
    </div>
  );
}

export default function IntegrationsSettingsPage() {
  const integrations = [
    {
      name: "Discord",
      description: "Mostre seu status do Discord e conecte servidores.",
      icon: "💬",
    },
    {
      name: "Twitch",
      description: "Exiba suas transmissões ao vivo no seu perfil.",
      icon: "🟣",
    },
    {
      name: "YouTube",
      description: "Vincule seu canal e mostre seus vídeos de gameplay.",
      icon: "🔴",
    },
    {
      name: "Kick",
      description: "Conecte sua conta Kick para transmissões ao vivo.",
      icon: "🟢",
    },
  ];

  return (
    <SettingsPageWrapper
      title="Integrações"
      description="Conecte serviços externos para enriquecer seu perfil e experiência."
    >
      <SettingsSection
        title="Serviços disponíveis"
        description="As integrações abaixo estarão disponíveis em breve."
      >
        {integrations.map((integration) => (
          <IntegrationCard key={integration.name} {...integration} />
        ))}
      </SettingsSection>
    </SettingsPageWrapper>
  );
}
