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
    <aside className="flex w-64 shrink-0 flex-col gap-1">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Configurações
      </p>
      {navItems.map((item) => {
        const active = pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <item.icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            <span className="flex-1">{item.label}</span>
            {active && <ChevronRight className="h-3.5 w-3.5 text-primary/60" />}
          </Link>
        );
      })}
    </aside>
  );
}

export function SettingsMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Seções de configurações"
      className="sticky top-[var(--layout-header-height)] z-10 border-b border-border/40 bg-background/95 backdrop-blur-xl md:hidden"
    >
      <div className="flex gap-1 overflow-x-auto px-3 py-2.5 scrollbar-hide">
        {navItems.map((item) => {
          const active = pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
