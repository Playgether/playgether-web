import { Metadata } from "next";
import { Suspense } from "react";
import BaseLayout from "../base-layout/components/structure/BaseLayout";
import { SearchResults } from "./SearchResults";

export const metadata: Metadata = {
  title: "Pesquisar — Playgether",
};

export default function SearchPage() {
  return (
    <BaseLayout>
      <Suspense>
        <SearchResults />
      </Suspense>
    </BaseLayout>
  );
}
