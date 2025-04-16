import React from "react";
import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";

export default function NotFoundProfile() {
  return (
    <NotFoundPages
      message="Não conseguimos encontrar o perfil que você está procurando."
      href="/feed"
      page="Feed"
    />
  );
}
