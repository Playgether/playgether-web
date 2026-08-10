"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomToast } from "@/components/ui/customSonner";
import {
  ArrowLeft,
  LogOut,
  MoreHorizontal,
  Trash2,
  UserX,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ConversationInterface } from "../../types/chat/ConversationInterface";

type RestrictedUser = { username: string };

type PendingAction =
  | "mute"
  | "unmute"
  | "block"
  | "leave"
  | "delete"
  | null;

const ACTION_COPY: Record<
  Exclude<PendingAction, null>,
  { title: string; description: string; confirm: string; destructive?: boolean }
> = {
  mute: {
    title: "Silenciar conversa?",
    description:
      "Tem certeza que deseja silenciar esta conversa? Você ainda receberá mensagens, mas com menos destaque.",
    confirm: "Silenciar",
  },
  unmute: {
    title: "Dessilenciar conversa?",
    description: "Tem certeza que deseja dessilenciar esta conversa?",
    confirm: "Dessilenciar",
  },
  block: {
    title: "Bloquear usuário?",
    description:
      "Tem certeza que deseja bloquear este usuário? Vocês não poderão mais trocar mensagens.",
    confirm: "Bloquear",
    destructive: true,
  },
  leave: {
    title: "Sair do grupo?",
    description:
      "Tem certeza que deseja sair deste grupo? Você ainda poderá ver o histórico antigo.",
    confirm: "Sair",
    destructive: true,
  },
  delete: {
    title: "Excluir conversa?",
    description:
      "Tem certeza que deseja excluir esta conversa? Ela será removida da sua lista.",
    confirm: "Excluir",
    destructive: true,
  },
};

export default function ChatHeader({
  selectedConversation,
  onBack,
  onLeaveGroup,
  onToggleMuteConversation,
  onDeleteConversation,
  onBlockUser,
}: {
  selectedConversation: ConversationInterface | null;
  onBack?: () => void;
  onLeaveGroup?: () => void | Promise<void>;
  onToggleMuteConversation?: () => void | Promise<void>;
  onDeleteConversation?: () => void | Promise<void>;
  onBlockUser?: () => void | Promise<void>;
}) {
  const username = selectedConversation?.username;
  const isPrivate = selectedConversation?.type === "private";
  const isGroup = selectedConversation?.type === "group";
  const hasLeft = Boolean(selectedConversation?.hasLeft);
  const showMenu = Boolean(selectedConversation);

  const [isBlocked, setIsBlocked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    if (!isPrivate || !username) {
      setIsBlocked(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const blockedRes = await fetch("/api/profiles/blocked/", { credentials: "include" });
        if (cancelled || !blockedRes.ok) return;
        const blocked = (await blockedRes.json()) as RestrictedUser[];
        setIsBlocked(Array.isArray(blocked) && blocked.some((u) => u.username === username));
      } catch {
        // keep defaults
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isPrivate, username]);

  if (!selectedConversation) {
    return (
      <div className="border-b border-border/50 bg-muted/50 p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-primary text-white">?</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-muted-foreground">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">No conversation selected</p>
          </div>
        </div>
      </div>
    );
  }

  const { name, avatar, isMuted } = selectedConversation;
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("") || "?";

  const profileHref = isPrivate && username ? `/profile/${username}` : null;
  const avatarSrc = typeof avatar === "string" ? avatar : avatar.src;

  const profileContent = (
    <>
      <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
        {avatarSrc ? <AvatarImage src={avatarSrc} alt={name} /> : null}
        <AvatarFallback className="bg-gradient-primary text-white">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-medium sm:text-base">{name}</h3>
        {hasLeft ? (
          <p className="text-xs text-muted-foreground sm:text-sm">Você saiu do grupo</p>
        ) : username ? (
          <p className="truncate text-xs text-muted-foreground sm:text-sm">@{username}</p>
        ) : isGroup ? (
          <p className="text-xs text-muted-foreground sm:text-sm">Grupo</p>
        ) : (
          <p className="text-xs text-neon-green sm:text-sm">Online</p>
        )}
      </div>
    </>
  );

  const runConfirmedAction = async () => {
    if (!pendingAction || actionLoading) return;
    const action = pendingAction;
    setActionLoading(true);
    try {
      if (action === "mute" || action === "unmute") {
        if (!onToggleMuteConversation) return;
        await onToggleMuteConversation();
        CustomToast.neutral(
          action === "unmute" ? "Conversa dessilenciada." : "Conversa silenciada."
        );
      } else if (action === "leave") {
        if (!onLeaveGroup) return;
        await onLeaveGroup();
        CustomToast.neutral("Você saiu do grupo.");
      } else if (action === "delete") {
        if (!onDeleteConversation) return;
        await onDeleteConversation();
        CustomToast.neutral("Conversa excluída.");
      } else if (action === "block") {
        if (!onBlockUser) return;
        await onBlockUser();
        setIsBlocked(true);
        CustomToast.info("Usuário bloqueado.");
      }
      setPendingAction(null);
    } catch {
      if (action === "mute" || action === "unmute") {
        CustomToast.error("Erro ao silenciar conversa.");
      } else if (action === "leave") {
        CustomToast.error("Erro ao sair do grupo.");
      } else if (action === "delete") {
        CustomToast.error("Erro ao excluir conversa.");
      } else if (action === "block") {
        CustomToast.error("Erro ao bloquear usuário.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const confirmCopy = pendingAction ? ACTION_COPY[pendingAction] : null;

  return (
    <div className="relative z-[80] border-b border-border/50 bg-muted/50 p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-muted/50 md:hidden"
            aria-label="Voltar para conversas"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : null}

        {profileHref ? (
          <Link
            href={profileHref}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary sm:gap-3"
          >
            {profileContent}
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">{profileContent}</div>
        )}

        {showMenu ? (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative z-[81] h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                disabled={actionLoading}
                aria-label="Mais opções"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="z-[100] border border-border/50 bg-background/95 backdrop-blur-xl"
            >
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setPendingAction(isMuted ? "unmute" : "mute");
                }}
                className="flex items-center gap-2 hover:bg-muted/50"
                disabled={actionLoading || !onToggleMuteConversation}
              >
                {isMuted ? (
                  <>
                    <Volume2 className="h-4 w-4" />
                    Dessilenciar
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4" />
                    Silenciar
                  </>
                )}
              </DropdownMenuItem>

              {isPrivate && username && !isBlocked ? (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setPendingAction("block");
                  }}
                  className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                  disabled={actionLoading || !onBlockUser}
                >
                  <UserX className="h-4 w-4" />
                  Bloquear
                </DropdownMenuItem>
              ) : null}

              {isGroup && !hasLeft ? (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setPendingAction("leave");
                  }}
                  className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                  disabled={actionLoading || !onLeaveGroup}
                >
                  <LogOut className="h-4 w-4" />
                  Sair do grupo
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setPendingAction("delete");
                }}
                className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                disabled={actionLoading || !onDeleteConversation}
              >
                <Trash2 className="h-4 w-4" />
                Excluir conversa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <AlertDialog
        open={pendingAction != null}
        onOpenChange={(open) => {
          if (!open && !actionLoading) setPendingAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmCopy?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmCopy?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={actionLoading}>
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              variant={confirmCopy?.destructive ? "destructive" : "default"}
              disabled={actionLoading}
              onClick={() => {
                void runConfirmedAction();
              }}
            >
              {actionLoading ? "Confirmando..." : confirmCopy?.confirm}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
