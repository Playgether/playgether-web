import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { SettingsSidebar } from "./components/SettingsSidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <BaseLayout>
      <div className="flex min-h-[calc(100dvh-var(--layout-header-height))] pl-20 pr-0">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col px-4 py-6 border-r border-border/50 bg-background/50 backdrop-blur-sm sticky top-[var(--layout-header-height)] h-[calc(100dvh-var(--layout-header-height))] overflow-y-auto shrink-0 w-72">
          <SettingsSidebar />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 px-8 py-8 max-w-3xl">
          {children}
        </div>
      </div>
    </BaseLayout>
  );
}
