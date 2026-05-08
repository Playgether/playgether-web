import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import React from "react";
import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";

export default function LoadingPages({ message }: { message: string }) {
  return (
    <BaseLayout>
      <div className="ml-0 md:ml-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex h-full min-h-layout-main w-full flex-col items-center justify-center gap-2 text-lg">
            <div className="flex">
              <p>{message}</p>
              <p className="motion-preset-typewriter">...</p>
            </div>
            <LoadingComponent className="h-8 w-8" />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
