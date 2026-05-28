"use client";

import {
  deleteChatRoomMessage,
  kickRoomMember,
  muteRoomMember,
} from "@/actions/roomRolesActions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROOM_MODERATION_DURATIONS } from "@/lib/roomModerationDurations";
import { cn } from "@/lib/utils";
import type { RoomKickScope } from "@/types/RoomPermissions";
import { Flag, MoreHorizontal, Trash2, UserMinus, VolumeX } from "lucide-react";
import { useState, useTransition } from "react";

const menuItemClass =
  "cursor-pointer focus:cursor-pointer";
const menuTriggerClass =
  "cursor-pointer";

function ModerationDurationSubmenu({
  label,
  icon: Icon,
  disabled,
  onPick,
}: {
  label: string;
  icon: typeof VolumeX;
  disabled?: boolean;
  onPick: (seconds: number | null) => void;
}) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        disabled={disabled}
        className={cn("gap-2", menuItemClass)}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {ROOM_MODERATION_DURATIONS.map((d) => (
          <DropdownMenuItem
            key={d.label}
            className={menuItemClass}
            onClick={() => onPick(d.seconds)}
          >
            {d.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

type KickConfirmState = {
  userId: number;
  memberName: string;
  durationSeconds: number | null;
};

type MuteConfirmState = {
  userId: number;
  memberName: string;
  durationSeconds: number | null;
};

function moderationDurationLabel(seconds: number | null): string {
  const found = ROOM_MODERATION_DURATIONS.find((d) => d.seconds === seconds);
  if (found) return found.label.toLowerCase();
  if (seconds == null) return "permanentemente";
  return "pelo tempo escolhido";
}

function kickScopeLabels(scope: RoomKickScope) {
  if (scope === "ambience") {
    return {
      menu: "Expulsar da transmissão",
      title: "Expulsar da transmissão?",
      description: (name: string) =>
        `Confirma expulsar ${name} desta transmissão? A pessoa poderá continuar na sala.`,
      confirm: "Expulsar da transmissão",
    };
  }
  return {
    menu: "Expulsar da sala",
    title: "Expulsar da sala?",
    description: (name: string) =>
      `Confirma expulsar ${name} desta sala? A pessoa será removida e não poderá voltar até o fim do banimento.`,
    confirm: "Expulsar da sala",
  };
}

export function RoomMemberModerationMenu({
  roomSlug,
  userId,
  memberName,
  canKick,
  canMute,
  kickScope = "room",
  onDone,
  triggerClassName,
}: {
  roomSlug: string;
  userId: number;
  memberName: string;
  canKick: boolean;
  canMute: boolean;
  kickScope?: RoomKickScope;
  onDone?: () => void;
  triggerClassName?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [kickConfirm, setKickConfirm] = useState<KickConfirmState | null>(null);
  const [muteConfirm, setMuteConfirm] = useState<MuteConfirmState | null>(null);

  if (!canKick && !canMute) return null;

  const kickLabels = kickScopeLabels(kickScope);

  const runKick = () => {
    if (!kickConfirm) return;
    const { userId: uid, durationSeconds } = kickConfirm;
    setKickConfirm(null);
    startTransition(async () => {
      await kickRoomMember(roomSlug, uid, { durationSeconds, scope: kickScope });
      onDone?.();
    });
  };

  const runMute = () => {
    if (!muteConfirm) return;
    const { userId: uid, durationSeconds } = muteConfirm;
    setMuteConfirm(null);
    startTransition(async () => {
      await muteRoomMember(roomSlug, uid, { durationSeconds });
      onDone?.();
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={isPending}
            className={cn(
              triggerClassName ??
                "cursor-pointer rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100",
              menuTriggerClass,
            )}
            aria-label="Moderar participante"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-52"
          onClick={(e) => e.stopPropagation()}
        >
          {canMute ? (
            <ModerationDurationSubmenu
              label="Silenciar"
              icon={VolumeX}
              disabled={isPending}
              onPick={(seconds) => {
                setMuteConfirm({
                  userId,
                  memberName,
                  durationSeconds: seconds,
                });
              }}
            />
          ) : null}
          {canKick ? (
            <ModerationDurationSubmenu
              label={kickLabels.menu}
              icon={UserMinus}
              disabled={isPending}
              onPick={(seconds) => {
                setKickConfirm({
                  userId,
                  memberName,
                  durationSeconds: seconds,
                });
              }}
            />
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={muteConfirm != null}
        onOpenChange={(open) => !open && setMuteConfirm(null)}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Silenciar membro?</AlertDialogTitle>
            <AlertDialogDescription>
              {muteConfirm
                ? `Confirma silenciar ${muteConfirm.memberName} por ${moderationDurationLabel(muteConfirm.durationSeconds)}? A pessoa não poderá enviar mensagens no chat da sala durante esse período.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={runMute}
            >
              Silenciar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={kickConfirm != null}
        onOpenChange={(open) => !open && setKickConfirm(null)}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{kickLabels.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {kickConfirm
                ? kickLabels.description(kickConfirm.memberName)
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={runKick}
            >
              {kickLabels.confirm}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function RoomMessageActionsMenu({
  roomSlug,
  messageId,
  authorId,
  authorName,
  canDelete,
  canKickAuthor,
  canMuteAuthor,
  kickScope = "room",
  onDeleted,
  onDeleteMessage,
  align = "end",
}: {
  roomSlug: string;
  messageId: number;
  authorId?: number | null;
  authorName: string;
  canDelete: boolean;
  canKickAuthor: boolean;
  canMuteAuthor: boolean;
  kickScope?: RoomKickScope;
  onDeleted?: () => void;
  onDeleteMessage?: () => Promise<{ ok: boolean }>;
  align?: "start" | "end";
}) {
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [kickConfirm, setKickConfirm] = useState<KickConfirmState | null>(null);
  const [muteConfirm, setMuteConfirm] = useState<MuteConfirmState | null>(null);
  const kickLabels = kickScopeLabels(kickScope);

  const hasModActions =
    authorId != null && (canDelete || canKickAuthor || canMuteAuthor);

  const runDelete = () => {
    setDeleteOpen(false);
    startTransition(async () => {
      const res = onDeleteMessage
        ? await onDeleteMessage()
        : await deleteChatRoomMessage(roomSlug, messageId);
      if (res.ok) onDeleted?.();
    });
  };

  const runKick = () => {
    if (!kickConfirm || authorId == null) return;
    const { durationSeconds } = kickConfirm;
    setKickConfirm(null);
    startTransition(async () => {
      await kickRoomMember(roomSlug, authorId, { durationSeconds, scope: kickScope });
    });
  };

  const runMute = () => {
    if (!muteConfirm || authorId == null) return;
    const { durationSeconds } = muteConfirm;
    setMuteConfirm(null);
    startTransition(async () => {
      await muteRoomMember(roomSlug, authorId, { durationSeconds });
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={isPending}
            className={cn(
              "cursor-pointer rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted/80 group-hover:opacity-100",
              menuTriggerClass,
            )}
            aria-label="Opções da mensagem"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-52">
          <DropdownMenuItem disabled className="cursor-default text-muted-foreground">
            <Flag className="mr-2 h-3.5 w-3.5" />
            Reportar mensagem
          </DropdownMenuItem>
          {hasModActions ? (
            <>
              <DropdownMenuSeparator />
              {canDelete ? (
                <DropdownMenuItem
                  className={cn(
                    "font-semibold text-destructive focus:bg-destructive/15 focus:text-destructive",
                    menuItemClass,
                  )}
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Excluir mensagem
                </DropdownMenuItem>
              ) : null}
              {canMuteAuthor && authorId != null ? (
                <ModerationDurationSubmenu
                  label={`Silenciar ${authorName}`}
                  icon={VolumeX}
                  disabled={isPending}
                  onPick={(seconds) => {
                    setMuteConfirm({
                      userId: authorId,
                      memberName: authorName,
                      durationSeconds: seconds,
                    });
                  }}
                />
              ) : null}
              {canKickAuthor && authorId != null ? (
                <ModerationDurationSubmenu
                  label={
                    kickScope === "ambience"
                      ? `Expulsar ${authorName} da transmissão`
                      : `Expulsar ${authorName} da sala`
                  }
                  icon={UserMinus}
                  disabled={isPending}
                  onPick={(seconds) => {
                    setKickConfirm({
                      userId: authorId,
                      memberName: authorName,
                      durationSeconds: seconds,
                    });
                  }}
                />
              ) : null}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir mensagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A mensagem será removida para todos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={runDelete}
            >
              Excluir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={muteConfirm != null}
        onOpenChange={(open) => !open && setMuteConfirm(null)}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Silenciar membro?</AlertDialogTitle>
            <AlertDialogDescription>
              {muteConfirm
                ? `Confirma silenciar ${muteConfirm.memberName} por ${moderationDurationLabel(muteConfirm.durationSeconds)}? A pessoa não poderá enviar mensagens no chat da sala durante esse período.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={runMute}
            >
              Silenciar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={kickConfirm != null}
        onOpenChange={(open) => !open && setKickConfirm(null)}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{kickLabels.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {kickConfirm
                ? kickLabels.description(kickConfirm.memberName)
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={runKick}
            >
              {kickLabels.confirm}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
