"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Flag, ExternalLink, Send, Link2, Code2, UserCircle2, Trash2, MessageCircle, MessageCircleOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { CustomToast } from "@/components/ui/customSonner";
import { Cut } from "@/types/Cut";
import { CutEmbedDialog } from "./CutEmbedDialog";

interface CutOptionsMenuProps {
  cut: Cut;
  onShare: () => void;
  onDeleted?: (cutId: string) => void;
  onCutUpdate?: (cut: Cut) => void;
}

export function CutOptionsMenu({ cut, onShare, onDeleted, onCutUpdate }: CutOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const router = useRouter();

  const copyLink = async () => {
    setOpen(false);
    const url = `${window.location.origin}/cuts/${cut.id}`;
    try {
      await navigator.clipboard.writeText(url);
      CustomToast.success("Link copiado!");
    } catch {
      CustomToast.error("Não foi possível copiar o link.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/cuts/${cut.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        CustomToast.success("Cut excluído.");
        onDeleted?.(cut.id);
      } else {
        const data = await res.json().catch(() => null);
        CustomToast.error(
          (Array.isArray(data?.detail) ? data.detail[0] : data?.detail) ?? "Erro ao excluir o cut.",
        );
      }
    } catch {
      CustomToast.error("Erro ao excluir o cut.");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleToggleComments = async () => {
    setOpen(false);
    const newState = !cut.comments_disabled;
    try {
      const res = await fetch(`/api/cuts/${cut.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments_disabled: newState }),
      });
      if (res.ok) {
        const updated = { ...cut, comments_disabled: newState };
        onCutUpdate?.(updated);
        CustomToast.neutral(
          newState ? "Comentários desativados." : "Comentários ativados.",
        );
      } else {
        CustomToast.error("Erro ao alterar configuração de comentários.");
      }
    } catch {
      CustomToast.error("Erro ao alterar configuração de comentários.");
    }
  };

  const handleReport = async () => {
    setReporting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_type: "cut", object_id: cut.id, reason: "other" }),
      });
      if (res.ok) {
        CustomToast.success("Denúncia enviada. Vamos analisar.");
      } else {
        const data = await res.json().catch(() => null);
        CustomToast.error(
          (Array.isArray(data?.detail) ? data.detail[0] : data?.detail) ?? "Erro ao denunciar.",
        );
      }
    } catch {
      CustomToast.error("Erro ao denunciar.");
    } finally {
      setReporting(false);
      setReportOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label="Mais opções" className="flex flex-col items-center gap-1">
            <MoreHorizontal className="h-6 w-6 text-white" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 border-border/50 bg-background/95 backdrop-blur-xl">
          {cut.is_own ? (
            <>
              <DropdownMenuItem onClick={() => void handleToggleComments()}>
                {cut.comments_disabled ? (
                  <>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Ligar comentários
                  </>
                ) : (
                  <>
                    <MessageCircleOff className="mr-2 h-4 w-4" />
                    Desligar comentários
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  setOpen(false);
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                setOpen(false);
                setReportOpen(true);
              }}
            >
              <Flag className="mr-2 h-4 w-4" />
              Denunciar
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              router.push(`/cuts/${cut.id}`);
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Ir para o post
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              onShare();
            }}
          >
            <Send className="mr-2 h-4 w-4" />
            Compartilhar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyLink}>
            <Link2 className="mr-2 h-4 w-4" />
            Copiar link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              setEmbedOpen(true);
            }}
          >
            <Code2 className="mr-2 h-4 w-4" />
            Incorporar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              router.push(`/profile/${cut.username}`);
            }}
          >
            <UserCircle2 className="mr-2 h-4 w-4" />
            Sobre esta conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border border-border/50 bg-background/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este Cut?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O cut será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={reportOpen} onOpenChange={setReportOpen}>
        <AlertDialogContent className="border border-border/50 bg-background/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Denunciar este cut?</AlertDialogTitle>
            <AlertDialogDescription>
              Nossa equipe vai revisar o conteúdo de @{cut.username}. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReport}
              disabled={reporting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {reporting ? "Enviando..." : "Denunciar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CutEmbedDialog cut={cut} open={embedOpen} onOpenChange={setEmbedOpen} />
    </>
  );
}
