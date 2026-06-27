"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Shield,
  Lock,
  Bell,
  Palette,
  Gamepad2,
  Plug,
  Monitor,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Conta", href: "/settings/account", icon: User },
  { label: "Privacidade", href: "/settings/privacy", icon: Shield },
  { label: "Segurança", href: "/settings/security", icon: Lock },
  { label: "Notificações", href: "/settings/notifications", icon: Bell },
  { label: "Aparência", href: "/settings/appearance", icon: Palette },
  { label: "Jogos Conectados", href: "/settings/games", icon: Gamepad2 },
  // { label: "Integrações", href: "/settings/integrations", icon: Plug }, // TODO: habilitar quando implementado
  { label: "Dispositivos", href: "/settings/devices", icon: Monitor },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-1">
      <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Configurações
      </p>
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <item.icon
              className={cn(
                "w-4 h-4 shrink-0 transition-colors",
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            <span className="flex-1">{item.label}</span>
            {active && <ChevronRight className="w-3.5 h-3.5 text-primary/60" />}
          </Link>
        );
      })}
    </aside>
  );
}
