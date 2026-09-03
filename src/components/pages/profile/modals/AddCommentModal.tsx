"use client";

import { useState, useEffect } from "react";
import { handleKeyDown } from "@/components/layouts/SendOnEnterKey/sendOnEnterKey";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MentionTextarea } from "@/components/mentions/MentionTextarea";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";

export function AddCommentModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  isSubmitting?: boolean;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!isOpen) setValue("");
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Comentário</DialogTitle>
          <DialogDescription>
            Escreva um comentário para o perfil.
          </DialogDescription>
        </DialogHeader>
        <MentionTextarea
          value={value}
          onChange={setValue}
          onKeyDown={(e) => handleKeyDown(e, () => { if (value.trim() && !isSubmitting) onSubmit(value); })}
          placeholder="Seu comentário..."
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={() => onSubmit(value)}
            disabled={isSubmitting || !value.trim()}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <LoadingComponent showText={false} className="h-4 w-4" />
                Salvando...
              </span>
            ) : (
              "Enviar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
