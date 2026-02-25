"use client";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import React from "react";

function FormLoginButton({ pending = false }: { pending?: boolean }) {
  return (
    <>
      {pending ? (
        <button
          className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-bold text-lg tracking-widest uppercase hover:scale-[1.02] hover:shadow-glow-primary transition-all duration-300 flex items-center justify-center gap-2"
          type="submit"
        >
          <LoadingComponent
            className="h-6 w-6"
            text="Logando..."
            showText={true}
          />
        </button>
      ) : (
        <button
          className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-bold text-lg tracking-widest uppercase hover:scale-[1.02] hover:shadow-glow-primary transition-all duration-300"
          type="submit"
        >
          LOGAR
        </button>
      )}
    </>
  );
}

export default FormLoginButton;
