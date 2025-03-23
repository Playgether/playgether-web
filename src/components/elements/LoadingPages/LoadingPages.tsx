import BaseLayout from "@/components/layouts/BaseLayout";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import React from "react";

export default function LoadingPages({ message }: { message: string }) {
  return (
    <BaseLayout>
      <div className="h-full max-w-[1420px] w-[90vw] flex items-center justify-center gap-1 text-lg min-h-[calc(100vh-160px)] max-h-[calc(100vh-160px)]">
        <p>{message}</p>
        <p className="motion-preset-typewriter">...</p>
        <LoadingComponent className="h-8 w-8" />
      </div>
    </BaseLayout>
  );
}
