import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import React from "react";
import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";

export default function LoadingPages({ message }: { message: string }) {
  return (
    <BaseLayout>
      <div className="mb-[120px] pt-16 ml-0 md:ml-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-lg min-h-[calc(100vh-64px)]">
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
