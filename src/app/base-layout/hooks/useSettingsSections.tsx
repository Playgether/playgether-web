// useSettingSections.tsx
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useBaseLayoutServerContext } from "../context/BaseLayoutServerContext";

export function useSettingSections() {
  // Verifica o tema atual do sistema ou localStorage
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return false;
  });

  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const { BaseLayout } = useBaseLayoutServerContext();

  // Efeito para sincronizar o tema com a classe do HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const settingSections = [
    {
      title: "Aparência",
      icon: BaseLayout.ServerSettingsModal.icons.Pallete,
      items: [
        {
          label: "Modo Escuro",
          description: "Alternar entre modo claro e escuro",
          component: (
            <div className="flex items-center gap-2">
              <Sun
                className={`w-4 h-4 ${
                  !darkMode ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <Switch
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
                className="data-[state=checked]:bg-primary"
              />
              <Moon
                className={`w-4 h-4 ${
                  darkMode ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </div>
          ),
        },
      ],
    },
    {
      title: "Notificações",
      icon: BaseLayout.ServerSettingsModal.icons.Bell,
      items: [
        {
          label: "Notificações Push",
          description: "Receber notificações em tempo real",
          component: (
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          ),
        },
      ],
    },
    {
      title: "Áudio",
      icon: BaseLayout.ServerSettingsModal.icons.Volume2,
      items: [
        {
          label: "Efeitos Sonoros",
          description: "Sons de interação da interface",
          component: (
            <Switch checked={soundEffects} onCheckedChange={setSoundEffects} />
          ),
        },
        {
          label: "Reprodução Automática",
          description: "Reproduzir vídeos automaticamente",
          component: (
            <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
          ),
        },
      ],
    },
    {
      title: "Privacidade",
      icon: BaseLayout.ServerSettingsModal.icons.Shield,
      items: [
        {
          label: "Perfil Público",
          description: "Permitir que outros vejam seu perfil",
          component: <Switch defaultChecked />,
        },
      ],
    },
  ];

  return { settingSections, darkMode, notifications, soundEffects, autoPlay };
}
