"use client";

import { useTermsContext } from "@/context/TermsContext";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

/**
 * Link que abre o modal de visualização dos termos.
 * Usado no footer, login, etc.
 */
export function TermsLink({ children = "Termos de Serviço", className }: Props) {
  const { openViewModal } = useTermsContext();
  return (
    <button
      type="button"
      onClick={() => openViewModal("terms")}
      className={className}
    >
      {children}
    </button>
  );
}
