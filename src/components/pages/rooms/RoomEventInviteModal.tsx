"use client";

import { joinRoomEvent, rejectRoomEventInvite } from "@/actions/roomEventsActions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthContext } from "@/context/AuthContext";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { useRoomEventSession } from "@/context/RoomEventSessionContext";
import { useEffect, useState, useTransition } from "react";

const TYPE_LABEL: Record<string, string> = {
  vote_best: "Vote no Melhor",
  quiz_elimination: "Quiz eliminatório",
  button_quiz: "Button Quiz",
};

export function RoomEventInviteModal({ roomSlug }: { roomSlug: string }) {
  const { user } = useAuthContext();
  const { roomEventInvite, clearRoomEventInvite } = useChatHandlerContext();
  const { refreshActiveEvent } = useRoomEventSession();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const invite = roomEventInvite?.room_slug === roomSlug ? roomEventInvite : null;
  const forGuest = Boolean(invite && user?.user_id && invite.organizer_user_id !== user.user_id);

  useEffect(() => {
    setOpen(Boolean(invite && forGuest));
  }, [invite, forGuest]);

  useEffect(() => {
    if (!invite || !forGuest) return;
    const endMs = invite.recruitment_deadline_at
      ? new Date(invite.recruitment_deadline_at).getTime()
      : Date.now() + 60_000;
    const closeIfExpired = () => {
      if (Date.now() >= endMs) {
        clearRoomEventInvite?.();
        setOpen(false);
      }
    };
    closeIfExpired();
    const id = window.setInterval(closeIfExpired, 1000);
    return () => window.clearInterval(id);
  }, [invite, forGuest, clearRoomEventInvite]);

  if (!invite || !forGuest) return null;

  const deadline = invite.recruitment_deadline_at ? new Date(invite.recruitment_deadline_at) : null;

  const handleAccept = () => {
    startTransition(async () => {
      await joinRoomEvent(invite.event_id);
      clearRoomEventInvite?.();
      setOpen(false);
      await refreshActiveEvent();
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      await rejectRoomEventInvite(invite.event_id);
      clearRoomEventInvite?.();
      setOpen(false);
      await refreshActiveEvent();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          clearRoomEventInvite?.();
          setOpen(false);
        }
      }}
    >
      <DialogContent className="border-border/80 sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-lg">Convite para evento</DialogTitle>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{invite.organizer_username}</span> criou um evento nesta
            sala.
          </p>
        </DialogHeader>
        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
          <p>
            <span className="text-muted-foreground">Nome:</span>{" "}
            <span className="font-medium text-foreground">{invite.title}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Modo:</span>{" "}
            {TYPE_LABEL[invite.event_type] ?? invite.event_type}
          </p>
          {deadline ? (
            <p className="text-xs text-muted-foreground">
              Você tem até {deadline.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} para entrar. Em
              seguida o evento começa automaticamente (1 minuto de janela).
            </p>
          ) : null}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" disabled={isPending} onClick={handleReject}>
            Recusar
          </Button>
          <Button type="button" disabled={isPending} onClick={handleAccept}>
            Aceitar e participar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
