import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import BaseLayout from "./base-layout/components/structure/BaseLayout";
import { BrandLogo } from "@/components/general/BrandLogo";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <BaseLayout>
      <main className="text-center flex flex-col max-h-[calc(100vh-160px)] min-h-[calc(100vh-160px)] w-full items-center justify-center ">
        <BrandLogo variant="icon" className="mb-3 h-20 w-20" />
        <h2 className="text-7xl leading-none">Oops...</h2>
        <p className="mt-3 text-lg">
          Não conseguimos encontrar a página que você está procurando.
        </p>
        <p className="mt-2">
          Voltar para página de
          <Link href="/feed" className="ml-1 NotFound-hover-link underline">
            Feed
          </Link>
        </p>
      </main>
    </BaseLayout>
  );
}
