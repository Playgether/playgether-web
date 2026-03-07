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
import NoImageProfile from "@/components/general/NoImageProfile";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";

interface BioTabProps {
  profile: getProfileByUsernameProps | null;
  comments: ApiResponseComments["data"];
  userHasCommented: boolean;
  onAddCommentClick: () => void;
  onEditComment: (commentId: number, newContent: string) => void;
  onDeleteComment: (commentId: number) => void;
  openConfirmModal: (type: string, data: any) => void;
  setEditingComment: (comment: any) => void;
  setIsEditCommentModalOpen: (open: boolean) => void;
}

export function BioTab({
  profile,
  comments,
  userHasCommented,
  onAddCommentClick,
  onEditComment,
  onDeleteComment,
  openConfirmModal,
  setEditingComment,
  setIsEditCommentModalOpen,
}: BioTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sobre mim</h3>
      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {profile?.bio || "Você não possui uma bio."}
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
          {!userHasCommented && (
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
                <div className="w-10 h-10 relative rounded-full overflow-hidden ring-2 ring-primary/30 mt-1">
                  {comment.created_by_user_photo ? (
                    <ImageComponent
                      media_id={comment.created_by_user_photo}
                      className="object-cover rounded-full h-10 w-10"
                    />
                  ) : (
                    <NoImageProfile
                      className="h-10 w-10"
                      iconClassName="w-6 h-6"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <div className="flex flex-col mt-1">
                      <span className="font-medium text-sm">
                        {comment.created_by_user_name ?? comment.author}
                      </span>
                      <span className="font-light text-xs text-muted-foreground">
                        @{comment.user_username ?? ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {comment.timestamp ? (
                          <DateAndHour date={comment.timestamp} />
                        ) : (
                          (comment.time ?? "")
                        )}
                      </span>
                    </div>
                    {comment.edited && (
                      <span className="text-xs text-muted-foreground">
                        (editado)
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {comment.comment ?? comment.content}
                  </p>
                </div>
                {comment.author === "Você" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingComment(comment);
                          setIsEditCommentModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
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
        </div>
      </div>
    </div>
  );
}
