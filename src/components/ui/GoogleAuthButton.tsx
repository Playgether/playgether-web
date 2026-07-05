"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";

interface GoogleAuthButtonProps {
  label?: string;
  onError?: (msg: string) => void;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleAuthButton({
  label = "Continuar com Google",
  onError,
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setLoading(true);

      try {
        const resp = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });

        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          const msg = (data as any)?.detail ?? "Erro ao autenticar com Google.";
          onError?.(msg);
          return;
        }

        // Hard navigation so all client contexts reinitialize with the new cookies
        window.location.href = "/feed";
      } catch {
        onError?.("Erro de conexão. Tente novamente.");
      } finally {
        setLoading(false);
        submittingRef.current = false;
      }
    },
    onError: () => {
      onError?.("Login com Google cancelado ou falhou.");
    },
  });

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => !submittingRef.current && login()}
      className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-border/60 bg-background/40 text-foreground text-sm font-medium hover:bg-muted/40 hover:border-border transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      ) : (
        <GoogleIcon />
      )}
      {label}
    </button>
  );
}
