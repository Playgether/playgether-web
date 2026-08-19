"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Plus, Trash2 } from "lucide-react";
import type { ProfileMilestone } from "@/services/getProfileMilestones";
import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";
import { getCloudinaryVideoUrl } from "@/app/utils/getCloudinaryVideo";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import TextLimitComponent from "@/components/layouts/SuspenseFallBack/TextLimitComponent/TextLimitComponent";

interface MilestonesTabProps {
  milestones: ProfileMilestone[];
  isLoading?: boolean;
  nextPage?: string | null;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  isOwner: boolean;
  onAddMilestone: () => void;
  onEditMilestone: (milestone: ProfileMilestone) => void;
  onDeleteMilestone: (milestone: ProfileMilestone) => void;
  onMilestoneClick: (milestone: ProfileMilestone) => void;
}

export function MilestonesTab({
  milestones,
  isLoading = false,
  nextPage = null,
  isLoadingMore = false,
  onLoadMore,
  isOwner,
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  onMilestoneClick,
}: MilestonesTabProps) {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold sm:text-lg">Marcos Pessoais</h3>
        {isOwner && (
          <Button
            size="sm"
            className="w-full bg-gradient-primary transition-all duration-200 hover:shadow-neon sm:w-auto"
            onClick={onAddMilestone}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Marco
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingComponent showText={false} className="h-10 w-10 text-muted-foreground" />
          </div>
        ) : milestones.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum marco cadastrado.
          </p>
        ) : (
          milestones.map((milestone) => (
            <Card
              key={milestone.id}
              className="hover:shadow-card transition-all duration-200 cursor-pointer"
              onClick={() => onMilestoneClick(milestone)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="min-w-0 flex-1 font-semibold leading-tight">
                    <TextLimitComponent text={milestone.title || ""} maxCharacters={50} />
                  </h4>
                  <div
                    className="flex shrink-0 items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Badge variant="outline" className="whitespace-nowrap text-xs">
                      {formatDate(milestone.date)}
                    </Badge>
                    {isOwner && (
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          sideOffset={2}
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditMilestone(milestone);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-500 focus:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteMilestone(milestone);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  {milestone.medias && milestone.medias.length > 0 && (
                    <div className="flex shrink-0 gap-1">
                      {milestone.medias.slice(0, 3).map((media) => (
                        <div
                          key={media.id}
                          className="pointer-events-none h-16 w-16 shrink-0 overflow-hidden rounded-lg"
                        >
                          {media.media_type === "video" ? (
                            <video
                              src={getCloudinaryVideoUrl(media.public_id)}
                              className="h-full w-full object-cover"
                              muted
                            />
                          ) : (
                            <img
                              src={
                                media.media_url ||
                                getCloudinaryUrl(media.public_id)
                              }
                              alt={milestone.title}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="min-w-0 flex-1 text-sm leading-relaxed text-muted-foreground">
                    <TextLimitComponent text={milestone.description || ""} maxCharacters={100} />
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        {nextPage && onLoadMore && (
          <div className="flex justify-center pt-6">
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
  );
}
