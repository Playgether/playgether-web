import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { SettingsSidebar, SettingsMobileNav } from "./components/SettingsSidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <BaseLayout>
      <div className="flex h-layout-main overflow-hidden lg:pl-20">
        {/* Sidebar — desktop: permanece fixa; só o conteúdo à direita rola */}
        <div className="hidden md:flex h-full w-72 shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r border-border/50 bg-background/50 px-4 py-6 backdrop-blur-sm">
          <SettingsSidebar />
        </div>

        {/* Content */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <SettingsMobileNav />
          <div className="w-full max-w-3xl flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
