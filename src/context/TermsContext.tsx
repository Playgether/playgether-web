"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { TermsViewModal } from "@/components/terms/TermsViewModal";

export type LegalDocumentData = {
  id: number;
  document_type: string;
  document_type_display: string;
  version: string;
  title: string;
  content: string;
  effective_at: string;
  created_at: string;
};

type TermsContextProps = {
  /** All active documents (for registration) */
  documents: LegalDocumentData[];
  /** Pending documents (user must accept) */
  pendingDocuments: LegalDocumentData[];
  loadDocuments: () => Promise<LegalDocumentData[]>;
  loadDocumentByType: (documentType: string) => Promise<LegalDocumentData | null>;
  loadPending: () => Promise<LegalDocumentData[]>;
  showTermsModal: (forceAccept?: boolean, pending?: LegalDocumentData[]) => void;
  openViewModal: (documentType?: string) => void;
  hideTermsModal: () => void;
  isModalOpen: boolean;
  forceAccept: boolean;
  acceptTerms: (documentIds: number[]) => Promise<boolean>;
  isAccepting: boolean;
  viewModalOpen: boolean;
  viewDocumentType: string | null;
  closeViewModal: () => void;
};

const TermsContext = createContext<TermsContextProps | null>(null);

export const useTermsContext = () => {
  const ctx = useContext(TermsContext);
  if (!ctx) {
    throw new Error("useTermsContext must be used within TermsProvider");
  }
  return ctx;
};

const TERMS_NOT_ACCEPTED_EVENT = "terms-not-accepted";

export type TermsNotAcceptedPayload = {
  pending_documents?: LegalDocumentData[];
};

export function dispatchTermsNotAccepted(payload?: TermsNotAcceptedPayload) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(TERMS_NOT_ACCEPTED_EVENT, { detail: payload ?? {} })
    );
  }
}

export function TermsProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<LegalDocumentData[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<LegalDocumentData[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forceAccept, setForceAccept] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDocumentType, setViewDocumentType] = useState<string | null>(null);

  const loadDocuments = useCallback(async (): Promise<LegalDocumentData[]> => {
    try {
      const res = await fetch("/api/terms/active", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results ?? [data];
        setDocuments(list);
        return list;
      }
    } catch {
      setDocuments([]);
    }
    return [];
  }, []);

  const loadDocumentByType = useCallback(
    async (documentType: string): Promise<LegalDocumentData | null> => {
      try {
        const res = await fetch(
          `/api/terms/active/${documentType}`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch {
        // ignore
      }
      return null;
    },
    []
  );

  const loadPending = useCallback(async (): Promise<LegalDocumentData[]> => {
    try {
      const res = await fetch("/api/terms/pending", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setPendingDocuments(list);
        return list;
      }
    } catch {
      setPendingDocuments([]);
    }
    return [];
  }, []);

  const acceptTerms = useCallback(
    async (documentIds: number[]): Promise<boolean> => {
      setIsAccepting(true);
      try {
        const res = await fetch("/api/terms/accept", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ document_ids: documentIds }),
        });
        if (res.ok) {
          setIsModalOpen(false);
          setForceAccept(false);
          setPendingDocuments([]);
          return true;
        }
      } catch {
        // ignore
      } finally {
        setIsAccepting(false);
      }
      return false;
    },
    []
  );

  const showTermsModal = useCallback(
    (force: boolean = false, pending?: LegalDocumentData[]) => {
      setForceAccept(force);
      if (pending && pending.length > 0) {
        setPendingDocuments(pending);
      }
      setIsModalOpen(true);
    },
    []
  );

  const hideTermsModal = useCallback(() => {
    if (!forceAccept) {
      setIsModalOpen(false);
    }
  }, [forceAccept]);

  const openViewModal = useCallback((documentType: string = "terms") => {
    setViewDocumentType(documentType);
    setViewModalOpen(true);
  }, []);

  // Intercept 403 TERMS_NOT_ACCEPTED (e.g. from axios) → show modal
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<TermsNotAcceptedPayload>;
      const payload = customEvent.detail ?? {};
      const pending = payload.pending_documents ?? [];
      loadPending().then((loaded) => {
        const toShow = pending.length > 0 ? pending : loaded;
        showTermsModal(true, toShow);
      });
    };
    window.addEventListener(TERMS_NOT_ACCEPTED_EVENT, handler);
    return () => window.removeEventListener(TERMS_NOT_ACCEPTED_EVENT, handler);
  }, [loadPending, showTermsModal]);

  const pathname = usePathname();
  // Proactive check: when user is on app (not login/register), if they have pending terms, show modal
  useEffect(() => {
    if (pathname === "/" || pathname?.startsWith("/register")) return;
    loadPending().then((pending) => {
      if (pending.length > 0) {
        showTermsModal(true, pending);
      }
    });
  }, [pathname, loadPending, showTermsModal]);

  const closeViewModal = useCallback(() => {
    setViewModalOpen(false);
    setViewDocumentType(null);
  }, []);

  return (
    <TermsContext.Provider
      value={{
        documents,
        pendingDocuments,
        loadDocuments,
        loadDocumentByType,
        loadPending,
        showTermsModal,
        openViewModal,
        hideTermsModal,
        isModalOpen,
        forceAccept,
        acceptTerms,
        isAccepting,
        viewModalOpen,
        viewDocumentType,
        closeViewModal,
      }}
    >
      {children}
      <TermsViewModal
        open={viewModalOpen}
        onOpenChange={(open) => !open && closeViewModal()}
        documentType={viewDocumentType ?? undefined}
      />
    </TermsContext.Provider>
  );
}
