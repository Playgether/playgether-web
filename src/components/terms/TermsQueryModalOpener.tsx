"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTermsContext } from "@/context/TermsContext";

const OPENABLE_DOC_TYPES = new Set(["privacy", "community", "cookies"]);

/** Abre o modal do documento indicado em ?doc= ao carregar /terms (ex: /terms?doc=privacy). */
export function TermsQueryModalOpener() {
  const searchParams = useSearchParams();
  const { openViewModal } = useTermsContext();
  const openedForRef = useRef<string | null>(null);

  useEffect(() => {
    const doc = searchParams.get("doc");
    if (doc && OPENABLE_DOC_TYPES.has(doc) && openedForRef.current !== doc) {
      openedForRef.current = doc;
      openViewModal(doc);
    }
  }, [searchParams, openViewModal]);

  return null;
}
