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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Marcos Pessoais</h3>
        {isOwner && (
          <Button
            className="bg-gradient-primary hover:shadow-neon transition-all duration-200"
            onClick={onAddMilestone}
          >
            <Plus className="h-4 w-4 mr-2" />
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
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {milestone.medias && milestone.medias.length > 0 && (
                    <div className="flex gap-1 flex-shrink-0">
                      {milestone.medias.slice(0, 3).map((media, idx) => (
                        <div
                          key={media.id}
                          className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 pointer-events-none"
                        >
                          {media.media_type === "video" ? (
                            <video
                              src={getCloudinaryVideoUrl(media.public_id)}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <img
                              src={
                                media.media_url ||
                                getCloudinaryUrl(media.public_id)
                              }
                              alt={milestone.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold flex-1 min-w-0 pr-2">
                        <TextLimitComponent text={milestone.title || ""} maxCharacters={50} />
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Badge variant="outline" className="text-xs">
                          {formatDate(milestone.date)}
                        </Badge>
                        {isOwner && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditMilestone(milestone);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500 focus:text-red-500 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteMilestone(milestone);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      <TextLimitComponent text={milestone.description || ""} maxCharacters={100} />
                    </p>
                  </div>
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
