import React from "react";
import Link from "next/link";

export default function NotFoundProfile() {
  return (
    <main className="text-center flex flex-col max-h-[calc(100vh-160px)] min-h-[calc(100vh-160px)] w-full items-center justify-center ">
      <h2 className="text-7xl">Oops...</h2>
      <p className="mt-5 text-lg">
        Não conseguimos encontrar a página que você está procurando.
      </p>
      <p className="mt-3">
        Voltar para página de
        <Link href="/feed" className="ml-1 NotFound-hover-link underline">
          Feed
        </Link>
      </p>
    </main>
  );
}
