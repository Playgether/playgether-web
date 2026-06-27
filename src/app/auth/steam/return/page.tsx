"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { refreshTokenServer } from "@/actions/refreshToken";
import { decodeUser } from "@/actions/decodeUser";

/**
 * Página intermediária após o OAuth Steam.
 * Renova o JWT no cliente antes de abrir /profile/biblioteca (Server Component exige token).
 */
export default function SteamReturnPage() {
  const router = useRouter();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    void (async () => {
      let hasSession = Boolean(await decodeUser());
      if (!hasSession) {
        hasSession = await refreshTokenServer();
      }
      if (!hasSession) {
        router.replace("/");
        return;
      }
      router.replace("/profile/biblioteca?steam_connected=1");
    })();
  }, [router]);

  return (
    <BaseLayout>
      <div className="flex min-h-[calc(100dvh-var(--layout-header-height)-var(--layout-quick-messages-height))] w-full items-center justify-center pl-20">
        <LoadingComponent text="Conectando Steam…" showText />
      </div>
    </BaseLayout>
  );
}
