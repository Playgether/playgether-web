"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Flag, ExternalLink, Send, Link2, Code2, UserCircle2 } from "lucide-react";
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
}

export function CutOptionsMenu({ cut, onShare }: CutOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
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
          {!cut.is_own && (
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
