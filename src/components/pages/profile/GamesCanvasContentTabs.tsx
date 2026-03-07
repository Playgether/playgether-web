"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import { ApiResponseComments } from "@/context/CommentsContext";
import { tabsData, initialMilestones } from "./constants";
import { BioTab } from "./tabs/BioTab";
import { GameStatsTab } from "./tabs/GameStatsTab";
import { MediaTab } from "./tabs/MediaTab";
import { PostsTab } from "./tabs/PostsTab";
import { AchievementsTab } from "./tabs/AchievementsTab";
import { MilestonesTab } from "./tabs/MilestonesTab";
import { GamesLibraryTab } from "./tabs/GamesLibraryTab";
import { AddCommentModal } from "./modals/AddCommentModal";
import { EditCommentModal } from "./modals/EditCommentModal";
import { ConfirmationModal } from "./modals/ConfirmationModal";
import { ImageModal } from "./modals/ImageModal";
import { MilestoneModal } from "./modals/MilestoneModal";
import { AchievementModal } from "./modals/AchievementModal";
import type { AchievementType } from "./modals/AchievementModal";

interface GamesCanvasContentTabsProps {
  profile: getProfileByUsernameProps | null;
  initialComments: ApiResponseComments;
}

export function GamesCanvasContentTabs({
  profile,
  initialComments,
}: GamesCanvasContentTabsProps) {
  const [activeTab, setActiveTab] = useState("bio");
  const [selectedGame, setSelectedGame] = useState("");
  const [comments, setComments] = useState(initialComments.data);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [selectedAchievement, setSelectedAchievement] =
    useState<AchievementType | null>(null);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: "", title: "" });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    data: any;
  } | null>(null);
  const [editingComment, setEditingComment] = useState<any>(null);
  const [isEditCommentModalOpen, setIsEditCommentModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [milestoneModalMode, setMilestoneModalMode] = useState<"add" | "edit">(
    "add",
  );
  const [userHasCommented, setUserHasCommented] = useState(false);
  const [isAddCommentModalOpen, setIsAddCommentModalOpen] = useState(false);

  const handleAddComment = (comment: string) => {
    if (!userHasCommented) {
      const newComment = {
        id: Date.now(),
        author: "Você",
        avatar: "EU",
        content: comment,
        time: "agora",
        edited: false,
      } as any;
      setComments((prev) => [newComment, ...prev]);
      setUserHasCommented(true);
    }
  };

  const handleEditComment = (commentId: number, newContent: string) => {
    setComments((prev) =>
      prev.map((comment: any) =>
        comment.id === commentId
          ? { ...comment, content: newContent, edited: true }
          : comment,
      ),
    );
  };

  const handleDeleteComment = (commentId: number) => {
    setComments((prev) =>
      prev.filter((comment: any) => comment.id !== commentId),
    );
    if ((comments as any[]).find((c) => c.id === commentId)?.author === "Você") {
      setUserHasCommented(false);
    }
  };

  const handleAddMilestone = (milestone: any) => {
    const newMilestone = {
      id: Date.now(),
      ...milestone,
    };
    setMilestones((prev) => [newMilestone, ...prev]);
  };

  const handleEditMilestone = (milestoneId: number, updatedMilestone: any) => {
    setMilestones((prev) =>
      prev.map((milestone) =>
        milestone.id === milestoneId
          ? { ...milestone, ...updatedMilestone }
          : milestone,
      ),
    );
  };

  const handleDeleteMilestone = (milestoneId: number) => {
    setMilestones((prev) =>
      prev.filter((milestone) => milestone.id !== milestoneId),
    );
  };

  const openConfirmModal = (type: string, data: any) => {
    setConfirmAction({ type, data });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case "deleteComment":
        handleDeleteComment(confirmAction.data.id);
        break;
      case "deleteMilestone":
        handleDeleteMilestone(confirmAction.data.id);
        break;
      case "addComment":
        handleAddComment(confirmAction.data.comment);
        break;
      case "addMilestone":
        handleAddMilestone(confirmAction.data.milestone);
        break;
    }
    setConfirmAction(null);
  };

  return (
    <div className="flex-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap justify-center lg:justify-start gap-1 bg-card border border-border p-1 mb-6 h-auto overflow-visible">
          {tabsData.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col items-center gap-1 p-3 min-w-[80px] h-auto data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-neon transition-all duration-200"
            >
              <tab.icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs whitespace-nowrap">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="bg-card rounded-lg border border-border shadow-card">
          <TabsContent value="bio" className="p-6 space-y-4">
            <BioTab
              profile={profile}
              comments={comments}
              userHasCommented={userHasCommented}
              onAddCommentClick={() => setIsAddCommentModalOpen(true)}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              openConfirmModal={openConfirmModal}
              setEditingComment={setEditingComment}
              setIsEditCommentModalOpen={setIsEditCommentModalOpen}
            />
          </TabsContent>

          <TabsContent value="game-stats" className="p-6">
            <GameStatsTab
              profile={profile}
              selectedGame={selectedGame}
              setSelectedGame={setSelectedGame}
            />
          </TabsContent>

          <TabsContent value="media" className="p-6">
            <MediaTab />
          </TabsContent>

          <TabsContent value="posts" className="p-6 space-y-4">
            <PostsTab />
          </TabsContent>

          <TabsContent value="achievements" className="p-6">
            <AchievementsTab
              onAchievementClick={(achievement) => {
                setSelectedAchievement(achievement);
                setIsAchievementModalOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="milestones" className="p-6">
            <MilestonesTab
              milestones={milestones}
              onAddMilestone={() => {
                setMilestoneModalMode("add");
                setEditingMilestone(null);
                setIsMilestoneModalOpen(true);
              }}
              onEditMilestone={(milestone) => {
                setEditingMilestone(milestone);
                setMilestoneModalMode("edit");
                setIsMilestoneModalOpen(true);
              }}
              onDeleteMilestone={(milestone) =>
                openConfirmModal("deleteMilestone", milestone)
              }
              onImageClick={(url, title) => {
                setSelectedImage({ url, title });
                setIsImageModalOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="games" className="p-6">
            <GamesLibraryTab />
          </TabsContent>
        </div>
      </Tabs>

      <AchievementModal
        isOpen={isAchievementModalOpen}
        onClose={() => setIsAchievementModalOpen(false)}
        achievement={selectedAchievement}
      />

      <MilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        onSubmit={(milestone) => {
          if (milestoneModalMode === "add") {
            openConfirmModal("addMilestone", { milestone });
          } else {
            handleEditMilestone(editingMilestone!.id, milestone);
          }
        }}
        milestone={editingMilestone}
        mode={milestoneModalMode}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImage.url}
        title={selectedImage.title}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          confirmAction?.type === "deleteComment"
            ? "Excluir Comentário"
            : confirmAction?.type === "deleteMilestone"
              ? "Excluir Marco"
              : confirmAction?.type === "addComment"
                ? "Adicionar Comentário"
                : confirmAction?.type === "addMilestone"
                  ? "Adicionar Marco"
                  : ""
        }
        description={
          confirmAction?.type === "deleteComment"
            ? "Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita."
            : confirmAction?.type === "deleteMilestone"
              ? "Tem certeza que deseja excluir este marco? Esta ação não pode ser desfeita."
              : confirmAction?.type === "addComment"
                ? "Tem certeza que deseja adicionar este comentário?"
                : confirmAction?.type === "addMilestone"
                  ? "Tem certeza que deseja adicionar este marco?"
                  : ""
        }
        confirmText={
          confirmAction?.type?.includes("delete") ? "Excluir" : "Adicionar"
        }
        destructive={confirmAction?.type?.includes("delete")}
      />

      <EditCommentModal
        isOpen={isEditCommentModalOpen}
        onClose={() => setIsEditCommentModalOpen(false)}
        onSubmit={(newContent) =>
          handleEditComment(editingComment?.id, newContent)
        }
        initialComment={editingComment?.content ?? editingComment?.comment ?? ""}
      />

      <AddCommentModal
        isOpen={isAddCommentModalOpen}
        onClose={() => setIsAddCommentModalOpen(false)}
        onSubmit={(comment) => openConfirmModal("addComment", { comment })}
      />
    </div>
  );
}
