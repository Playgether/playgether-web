"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Pin,
  PinOff,
  EyeOff,
  Eye,
  Flag,
  VolumeX,
  UserX,
} from "lucide-react";
import { CustomToast } from "@/components/ui/customSonner";
import { PostsCommentsProps } from "@/services/getComments";

interface CommentActionMenuProps {
  comment: PostsCommentsProps;
  postOwnerUsername: string;
  currentUsername: string | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onCommentUpdate: (updatedComment: PostsCommentsProps) => void;
  isReply?: boolean;
}

export function CommentActionMenu({
  comment,
  postOwnerUsername,
  currentUsername,
  onEdit,
  onDelete,
  onCommentUpdate,
  isReply = false,
}: CommentActionMenuProps) {
  const [loading, setLoading] = useState(false);

  if (!currentUsername) return null;

  const isMyComment = comment.user_username === currentUsername;
  const isPostOwner = postOwnerUsername === currentUsername && !isMyComment;
  const isRandomViewer = !isMyComment && !isPostOwner;

  const handlePin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}/pin`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        onCommentUpdate({ ...comment, is_pinned: data.is_pinned });
        CustomToast.success(data.is_pinned ? "Comentário fixado." : "Comentário desfixado.");
      } else {
        CustomToast.error("Erro ao fixar comentário.");
      }
    } catch {
      CustomToast.error("Erro ao fixar comentário.");
    } finally {
      setLoading(false);
    }
  };

  const handleHide = async () => {
    setLoading(true);
    const isCurrentlyHidden = comment.is_hidden;
    try {
      const res = await fetch(`/api/comments/${comment.id}/hide`, {
        method: isCurrentlyHidden ? "DELETE" : "POST",
      });
      if (res.ok) {
        const data = await res.json();
        onCommentUpdate({ ...comment, is_hidden: data.is_hidden });
        CustomToast.neutral(data.is_hidden ? "Comentário oculto." : "Comentário exibido.");
      } else {
        CustomToast.error("Erro ao ocultar comentário.");
      }
    } catch {
      CustomToast.error("Erro ao ocultar comentário.");
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: "comment",
          object_id: comment.id,
          reason: "other",
        }),
      });
      if (res.ok || res.status === 201) {
        CustomToast.warning("Denúncia enviada. Nossa equipe irá analisar o comentário.");
      } else {
        CustomToast.error("Erro ao enviar denúncia.");
      }
    } catch {
      CustomToast.error("Erro ao enviar denúncia.");
    } finally {
      setLoading(false);
    }
  };

  const handleMute = async () => {
    setLoading(true);
    try {
      await fetch(`/api/profiles/${comment.user_username}/mute`, { method: "POST" });
      CustomToast.neutral("Usuário silenciado.");
    } catch {
      CustomToast.error("Erro ao silenciar usuário.");
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    setLoading(true);
    try {
      await fetch(`/api/profiles/${comment.user_username}/block`, { method: "POST" });
      CustomToast.info("Usuário bloqueado.");
    } catch {
      CustomToast.error("Erro ao bloquear usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          disabled={loading}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-background/95 backdrop-blur-xl border border-border/50"
      >
        {isMyComment && (
          <>
            <DropdownMenuItem
              onClick={onEdit}
              className="flex items-center gap-2 hover:bg-muted/50"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </>
        )}

        {isPostOwner && (
          <>
            <DropdownMenuItem
              onClick={onDelete}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </DropdownMenuItem>
            {!isReply && (
              <>
                <DropdownMenuItem
                  onClick={handlePin}
                  className="flex items-center gap-2 hover:bg-muted/50"
                >
                  {comment.is_pinned ? (
                    <>
                      <PinOff className="h-4 w-4" />
                      Desafixar
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4" />
                      Fixar no topo
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleHide}
                  className="flex items-center gap-2 hover:bg-muted/50"
                >
                  {comment.is_hidden ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Exibir comentário
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Ocultar comentário
                    </>
                  )}
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleReport}
              className="flex items-center gap-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
            >
              <Flag className="h-4 w-4" />
              Denunciar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleMute}
              className="flex items-center gap-2 hover:bg-muted/50"
            >
              <VolumeX className="h-4 w-4" />
              Silenciar usuário
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleBlock}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <UserX className="h-4 w-4" />
              Bloquear conta
            </DropdownMenuItem>
          </>
        )}

        {isRandomViewer && (
          <>
            <DropdownMenuItem
              onClick={handleReport}
              className="flex items-center gap-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
            >
              <Flag className="h-4 w-4" />
              Denunciar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleBlock}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <UserX className="h-4 w-4" />
              Bloquear conta
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
