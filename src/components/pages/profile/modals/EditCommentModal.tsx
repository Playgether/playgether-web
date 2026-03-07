"use client";

import { useState } from "react";
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

export function EditCommentModal({
  isOpen,
  onClose,
  onSubmit,
  initialComment,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newContent: string) => void;
  initialComment: string;
}) {
  const [value, setValue] = useState(initialComment);

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
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSubmit(value);
              onClose();
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
