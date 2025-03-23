import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";
import React from "react";

export default function NotFoundRoom() {
  return (
    <NotFoundPages
      message="Não conseguimos encontrar a sala que você está procurando."
      href="/feed"
      page="Feed"
    />
  );
}
