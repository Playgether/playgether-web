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

interface Milestone {
  id: number;
  title: string;
  description: string;
  date: string;
  image: string | null;
}

interface MilestonesTabProps {
  milestones: Milestone[];
  onAddMilestone: () => void;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestone: Milestone) => void;
  onImageClick: (url: string, title: string) => void;
}

export function MilestonesTab({
  milestones,
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  onImageClick,
}: MilestonesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Marcos Pessoais</h3>
        <Button
          className="bg-gradient-primary hover:shadow-neon transition-all duration-200"
          onClick={onAddMilestone}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Marco
        </Button>
      </div>

      <div className="space-y-4">
        {milestones.map((milestone) => (
          <Card
            key={milestone.id}
            className="hover:shadow-card transition-all duration-200"
          >
            <CardContent className="p-6">
              <div className="flex gap-4">
                {milestone.image && (
                  <div
                    className="w-16 h-16 bg-gradient-primary/10 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() =>
                      onImageClick(milestone.image!, milestone.title)
                    }
                  >
                    <img
                      src={milestone.image}
                      alt={milestone.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{milestone.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {milestone.date}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => onEditMilestone(milestone)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={() => onDeleteMilestone(milestone)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
