"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  destructive,
  isConfirming,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  destructive?: boolean;
  isConfirming?: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancelar
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={() => onConfirm()}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <span className="flex items-center gap-2">
                <LoadingComponent showText={false} className="h-4 w-4" />
                Excluindo...
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
