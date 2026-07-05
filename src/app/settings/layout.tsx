import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { SettingsSidebar, SettingsMobileNav } from "./components/SettingsSidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <BaseLayout>
      <div className="flex min-h-[calc(100dvh-var(--layout-header-height)-var(--layout-bottom-nav-height))] lg:min-h-[calc(100dvh-var(--layout-header-height))] lg:pl-20">
        {/* Sidebar — desktop */}
        <div className="hidden md:flex sticky top-[var(--layout-header-height)] h-[calc(100dvh-var(--layout-header-height))] w-72 shrink-0 flex-col overflow-y-auto border-r border-border/50 bg-background/50 px-4 py-6 backdrop-blur-sm">
          <SettingsSidebar />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <SettingsMobileNav />
          <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-3xl">
            {children}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
