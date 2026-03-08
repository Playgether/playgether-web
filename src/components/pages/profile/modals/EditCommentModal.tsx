"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";

export function EditCommentModal({
  isOpen,
  onClose,
  onSubmit,
  initialComment,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newContent: string) => void;
  initialComment: string;
  isSubmitting?: boolean;
}) {
  const [value, setValue] = useState(initialComment);

  useEffect(() => {
    if (isOpen) {
      setValue(initialComment);
    }
  }, [initialComment, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Comentário</DialogTitle>
          <DialogDescription>
            Atualize o conteúdo do comentário.
          </DialogDescription>
        </DialogHeader>
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={() => onSubmit(value)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <LoadingComponent showText={false} className="h-4 w-4" />
                Salvando...
              </span>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
