import React from "react";
import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";
import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";

export default function NotFoundProfile() {
  return (
    <BaseLayout>
      <NotFoundPages
        message="Não conseguimos encontrar o perfil que você está procurando."
        href="/feed"
        page="Feed"
      />
    </BaseLayout>
  );
}
