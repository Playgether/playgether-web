import React from "react";
import Link from "next/link";

export default function NotFoundPages({
  message,
  page,
  href,
}: {
  message: string;
  page: string;
  href: string;
}) {
  return (
    <main className="text-center flex flex-col max-h-[calc(100vh-160px)] min-h-[calc(100vh-160px)] w-full items-center justify-center ">
      <h2 className="text-7xl">Oops...</h2>
      <p className="mt-5 text-lg">{message}</p>
      <p className="mt-3">
        Voltar para página de
        <Link href={href} className="ml-1 NotFound-hover-link underline">
          {page}
        </Link>
      </p>
    </main>
  );
}
