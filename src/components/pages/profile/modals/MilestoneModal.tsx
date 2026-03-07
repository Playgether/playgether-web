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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function MilestoneModal({
  isOpen,
  onClose,
  onSubmit,
  milestone,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (milestone: any) => void;
  milestone: any;
  mode: "add" | "edit";
}) {
  const [title, setTitle] = useState(milestone?.title || "");
  const [description, setDescription] = useState(milestone?.description || "");
  const [date, setDate] = useState(milestone?.date || "");
  const [image, setImage] = useState(milestone?.image || "");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Adicionar Marco" : "Editar Marco"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do marco.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição"
          />
          <Input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Data"
          />
          <Input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="URL da imagem (opcional)"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSubmit({ title, description, date, image: image || null });
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
