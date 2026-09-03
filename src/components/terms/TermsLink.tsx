"use client";

import { useTermsContext } from "@/context/TermsContext";

type Props = {
  documentType?: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Link que abre o modal de visualização de um documento legal
 * (terms, privacy, community, cookies). Usado no footer, login, etc.
 */
export function TermsLink({
  documentType = "terms",
  children = "Termos de Serviço",
  className,
}: Props) {
  const { openViewModal } = useTermsContext();
  return (
    <button
      type="button"
      onClick={() => openViewModal(documentType)}
      className={className}
    >
      {children}
    </button>
  );
}
