"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MessageCircle, MoreVertical, Plus, Trash2 } from "lucide-react";
import { Gamepad2Icon, ChartNoAxesColumn } from "lucide-react";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import { ApiResponseComments } from "@/context/CommentsContext";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import { games } from "../constants";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { HighlightedAchievementBadges } from "@/components/achievements/HighlightedAchievementBadges";

interface BioTabProps {
  profile: getProfileByUsernameProps | null;
  comments: ApiResponseComments["data"];
  userHasCommented: boolean;
  isOwner: boolean;
  nextPage: string | null;
  isLoadingMore: boolean;
  onAddCommentClick: () => void;
  onEditComment: (commentId: number, newContent: string) => void;
  onDeleteComment: (commentId: number) => void;
  onLoadMore: () => void;
  openConfirmModal: (type: string, data: any) => void;
  setEditingComment: (comment: any) => void;
  setIsEditCommentModalOpen: (open: boolean) => void;
  currentUserUsername?: string | null;
}

export function BioTab({
  profile,
  comments,
  userHasCommented,
  isOwner,
  nextPage,
  isLoadingMore,
  onAddCommentClick,
  onEditComment,
  onDeleteComment,
  onLoadMore,
  openConfirmModal,
  setEditingComment,
  setIsEditCommentModalOpen,
  currentUserUsername,
}: BioTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sobre mim</h3>
      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {profile?.bio}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Gamepad2Icon className="h-6 w-6 text-card-foreground" />
            Jogos Principais
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gradient-primary/10 rounded-lg border border-primary/20">
              <img
                src={games[0].image}
                alt="Valorant"
                className="w-8 h-8 rounded object-cover"
              />
              <div>
                <div className="font-medium text-card-foreground">Valorant</div>
                <div className="text-sm text-muted-foreground">
                  Rank: Diamond 2
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-secondary/10 rounded-lg border border-secondary/20">
              <img
                src={games[1].image}
                alt="League of Legends"
                className="w-8 h-8 rounded object-cover"
              />
              <div>
                <div className="font-medium text-card-foreground">
                  League of Legends
                </div>
                <div className="text-sm text-muted-foreground">
                  Rank: Platinum 1
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-primary/10 rounded-lg border border-primary/20">
              <img
                src={games[2].image}
                alt="CS:GO"
                className="w-8 h-8 rounded object-cover"
              />
              <div>
                <div className="font-medium text-card-foreground">CS:GO</div>
                <div className="text-sm text-muted-foreground">
                  Rank: Global Elite
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <ChartNoAxesColumn className="h-6 w-6 text-card-foreground" />
            Estatísticas Rápidas
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
              <span className="text-muted-foreground">Tempo de jogo</span>
              <span className="font-semibold text-card-foreground">
                {(profile?.hours_played ?? 2340).toLocaleString()}h
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
              <span className="text-muted-foreground">Conta criada em</span>
              <span className="font-semibold text-card-foreground">
                Jan 2019
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-border">
        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-card-foreground" />
          Comentários
        </h4>
        <div className="space-y-4">
          {!isOwner && !userHasCommented && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="hover:shadow-card transition-shadow duration-200"
                onClick={onAddCommentClick}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Comentário
              </Button>
            </div>
          )}
          {comments?.length > 0 ? (
            comments?.map((comment: any) => (
              <div
                key={comment.id}
                className="flex gap-3 p-4 bg-card/30 rounded-lg border border-border/50"
              >
                <div className="mt-1 shrink-0">
                  <ProfileAvatar
                    displayName={
                      comment.created_by_user_name ?? comment.author ?? "?"
                    }
                    username={comment.user_username}
                    profilePhoto={comment.created_by_user_photo}
                    sizeClass="h-10 w-10"
                    ringClass="ring-2 ring-primary/30"
                    fallbackTextClassName="text-xs"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-x-2 gap-y-1 mb-2 items-start justify-between">
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-sm shrink-0">
                          {comment.created_by_user_name ?? comment.author}
                        </span>
                        <HighlightedAchievementBadges
                          achievements={comment.highlighted_achievements}
                        />
                      </div>
                      <span className="font-light text-xs text-muted-foreground">
                        @{comment.user_username ?? ""}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0 justify-end">
                      <span className="text-xs text-muted-foreground">
                        {comment.timestamp ? (
                          <DateAndHour date={comment.timestamp} />
                        ) : (
                          (comment.time ?? "")
                        )}
                      </span>
                      {comment.edited && (
                        <span className="text-xs text-muted-foreground">
                          (editado)
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {comment.comment ?? comment.content}
                  </p>
                </div>
                {(comment.author === "Você" ||
                  comment.user_username === currentUserUsername) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          setEditingComment(comment);
                          setIsEditCommentModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500 cursor-pointer"
                        onClick={() =>
                          openConfirmModal("deleteComment", comment)
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))
          ) : (
            <div className="flex justify-center">
              <p className="text-muted-foreground">
                Nenhum comentário encontrado
              </p>
            </div>
          )}
          {nextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="hover:shadow-card transition-shadow duration-200"
              >
                {isLoadingMore ? (
                  <span className="flex items-center gap-2">
                    <LoadingComponent showText={false} className="h-4 w-4" />
                    Carregando...
                  </span>
                ) : (
                  "Carregar mais"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
