import BaseLayout from "@/components/layouts/BaseLayout";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import React from "react";

export default function LoadingPages({ message }: { message: string }) {
  return (
    <BaseLayout>
      <div className="h-full w-[90vw] flex flex-col items-center justify-center gap-1 text-lg min-h-[calc(100vh-160px)] max-h-[calc(100vh-160px)]">
        <div className="flex">
          <p>{message}</p>
          <p className="motion-preset-typewriter">...</p>
        </div>
        <LoadingComponent className="h-8 w-8" />
      </div>
    </BaseLayout>
  );
}
