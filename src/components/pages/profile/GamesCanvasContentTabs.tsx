"use client";

import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import { ApiResponseComments } from "@/context/CommentsContext";
import { tabsData } from "./constants";
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
import { MilestoneModal } from "./modals/MilestoneModal";
import { MilestoneDetailModal } from "./modals/MilestoneDetailModal";
import { AchievementModal } from "./modals/AchievementModal";
import type { AchievementType } from "./modals/AchievementModal";
import { useAuthContext } from "@/context/AuthContext";
import { postComment } from "@/services/postComment";
import { updateCommentAction } from "@/actions/updateComment";
import { deleteCommentAction } from "@/actions/deleteComment";
import { CommentContentType } from "@/components/content_types/CommentContentType";
import { getProfileCommentsClient } from "@/services/getProfileComments";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { CustomToastProps } from "@/error/custom-toaster/enum";
import { ProfilePostModal } from "./ProfilePostModal";
import { useProfilePostsContext } from "@/app/profile/context/ProfilePostsContext";
import { deletePostProfile } from "@/services/deletePostProfile";
import { getProfileMilestonesClient } from "@/services/getProfileMilestones";
import { createMilestone, updateMilestone } from "@/actions/milestones";
import { deleteMilestone } from "@/services/deleteMilestone";
import { deletePostFile } from "@/services/cloudinary_requests/deletePostFile";

interface GamesCanvasContentTabsProps {
  profile: getProfileByUsernameProps | null;
  initialComments: ApiResponseComments;
  onProfileUpdated?: (updated: Partial<getProfileByUsernameProps>) => void;
}

export function GamesCanvasContentTabs({
  profile,
  initialComments,
  onProfileUpdated,
}: GamesCanvasContentTabsProps) {
  const { user } = useAuthContext();
  const postsContext = useProfilePostsContext();
  const { removePost, getPostById } = postsContext;
  const isOwner = !!user && !!profile && user.username === profile.username;

  const [activeTab, setActiveTab] = useState("bio");
  const [selectedGame, setSelectedGame] = useState("");
  const [comments, setComments] = useState<any[]>(initialComments.data ?? []);
  const [nextPage, setNextPage] = useState<string | null>(
    initialComments.next_page ?? null
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [milestonesNextPage, setMilestonesNextPage] = useState<string | null>(null);
  const [hasLoadedMilestones, setHasLoadedMilestones] = useState(false);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [isLoadingMoreMilestones, setIsLoadingMoreMilestones] = useState(false);
  const [selectedAchievement, setSelectedAchievement] =
    useState<AchievementType | null>(null);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isMilestoneDetailModalOpen, setIsMilestoneDetailModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    data: any;
  } | null>(null);
  const [editingComment, setEditingComment] = useState<any>(null);
  const [isEditCommentModalOpen, setIsEditCommentModalOpen] = useState(false);
  const [isEditCommentSubmitting, setIsEditCommentSubmitting] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [milestoneModalMode, setMilestoneModalMode] = useState<"add" | "edit">(
    "add",
  );
  const [userHasCommented, setUserHasCommented] = useState(false);

  useEffect(() => {
    if (!user) {
      setUserHasCommented(false);
      return;
    }
    const hasComment = comments.some(
      (c: any) => c.user_username === user.username
    );
    setUserHasCommented(hasComment);
  }, [user?.username, comments]);

  useEffect(() => {
    if (!profile?.id) {
      setMilestones([]);
      setMilestonesNextPage(null);
      setHasLoadedMilestones(false);
      return;
    }
  }, [profile?.id]);

  useEffect(() => {
    if (activeTab === "milestones" && profile?.id && !hasLoadedMilestones) {
      setIsLoadingMilestones(true);
      getProfileMilestonesClient(profile.id, null, 10)
        .then((res) => {
          setMilestones(res.data ?? []);
          setMilestonesNextPage(res.next_page ?? null);
          setHasLoadedMilestones(true);
        })
        .finally(() => setIsLoadingMilestones(false));
    }
  }, [activeTab, profile?.id, hasLoadedMilestones]);

  const loadMoreMilestones = useCallback(async () => {
    if (!profile?.id || !milestonesNextPage || isLoadingMoreMilestones) return;
    let cursor: string | null = null;
    try {
      const url = milestonesNextPage.startsWith("http")
        ? milestonesNextPage
        : `http://dummy${milestonesNextPage.startsWith("?") ? "/" : ""}${milestonesNextPage}`;
      cursor = new URL(url).searchParams.get("cursor");
    } catch {
      cursor = null;
    }
    if (!cursor) return;
    setIsLoadingMoreMilestones(true);
    try {
      const res = await getProfileMilestonesClient(profile.id, cursor, 10);
      setMilestones((prev) => [...prev, ...(res.data ?? [])]);
      setMilestonesNextPage(res.next_page ?? null);
    } finally {
      setIsLoadingMoreMilestones(false);
    }
  }, [profile?.id, milestonesNextPage, isLoadingMoreMilestones]);
  const [isAddCommentModalOpen, setIsAddCommentModalOpen] = useState(false);
  const [isAddCommentSubmitting, setIsAddCommentSubmitting] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isDeletingMilestone, setIsDeletingMilestone] = useState(false);
  const [isMilestoneSubmitting, setIsMilestoneSubmitting] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const loadMoreComments = useCallback(async () => {
    if (!profile || !nextPage || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      let cursor: string | null = null;
      try {
        const url = nextPage.startsWith("http")
          ? nextPage
          : `http://dummy${nextPage.startsWith("?") ? "/" : "/"}${nextPage}`;
        cursor = new URL(url).searchParams.get("cursor");
      } catch {
        cursor = null;
      }
      const res = await getProfileCommentsClient(
        profile.username ?? profile.id,
        cursor
      );
      setComments((prev) => [...prev, ...(res.data ?? [])]);
      setNextPage(res.next_page ?? null);
    } catch (err) {
      CustomToast.error("Erro ao carregar comentários", {
        duration: CustomToastProps.defaultDuration,
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [profile, nextPage, isLoadingMore]);

  const handleAddComment = async (comment: string) => {
    if (!profile || !comment.trim() || isAddCommentSubmitting) return;
    setIsAddCommentSubmitting(true);
    const optimisticId = `opt-${Date.now()}`;
    const optimisticComment = {
      id: optimisticId,
      author: "Você",
      content: comment.trim(),
      user_username: user?.username,
      comment: comment.trim(),
      timestamp: new Date().toISOString(),
      is_optimistic: true,
    };
    setComments((prev) => [optimisticComment as any, ...prev]);
    setUserHasCommented(true);
    setIsAddCommentModalOpen(false);
    try {
      const created = await postComment({
        comment: comment.trim(),
        object_id: profile.id,
        content_type: CommentContentType.profile,
      });
      const mapped = {
        ...created,
        author: "Você",
        content: created.comment,
        user_username: user?.username,
      };
      setComments((prev) =>
        prev.map((c: any) =>
          c.id === optimisticId ? mapped : c
        )
      );
      CustomToast.success("Comentário adicionado!", {
        duration: CustomToastProps.defaultDuration,
      });
    } catch (err: any) {
      setComments((prev) => prev.filter((c: any) => c.id !== optimisticId));
      setUserHasCommented(false);
      CustomToast.error("Erro ao adicionar comentário", {
        description: (err as any)?.message ?? "Tente novamente.",
        duration: CustomToastProps.defaultDuration,
      });
    } finally {
      setIsAddCommentSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: number, newContent: string) => {
    if (!profile || !newContent.trim() || isEditCommentSubmitting) return;
    setIsEditCommentSubmitting(true);
    try {
      const response = await updateCommentAction({
        comment_id: commentId,
        comment: newContent.trim(),
        object_id: profile.id,
        content_type: CommentContentType.profile,
      });
      setComments((prev) =>
        prev.map((c: any) =>
          c.id === commentId ? { ...c, comment: newContent.trim(), edited: true, ...response } : c
        )
      );
      setIsEditCommentModalOpen(false);
      setEditingComment(null);
      CustomToast.success("Comentário atualizado!", {
        duration: CustomToastProps.defaultDuration,
      });
    } catch (err: any) {
      CustomToast.error("Erro ao atualizar comentário", {
        description: err?.message ?? "Tente novamente.",
        duration: CustomToastProps.defaultDuration,
      });
    } finally {
      setIsEditCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const wasUserComment = comments.some(
      (c: any) => c.id === commentId && c.user_username === user?.username
    );
    setIsDeletingComment(true);
    try {
      await deleteCommentAction(commentId);
      setComments((prev) => prev.filter((c: any) => c.id !== commentId));
      setConfirmModalOpen(false);
      setConfirmAction(null);
      if (wasUserComment) setUserHasCommented(false);
      CustomToast.success("Comentário excluído!", {
        duration: CustomToastProps.defaultDuration,
      });
    } catch (err: any) {
      CustomToast.error("Erro ao excluir comentário", {
        description: (err as any)?.message ?? "Tente novamente.",
        duration: CustomToastProps.defaultDuration,
      });
    } finally {
      setIsDeletingComment(false);
    }
  };

  const handleMilestoneSubmit = async (data: {
    title: string;
    description: string;
    date: string;
    medias: { media_url: string; media_type: string; public_id: string }[];
  }) => {
    if (!profile) return;
    setIsMilestoneSubmitting(true);
    try {
      if (milestoneModalMode === "add") {
        const res = await createMilestone(profile.id, data);
        if (res.status === 201 && res.data) {
          setMilestones((prev) => [res.data, ...prev]);
          setIsMilestoneModalOpen(false);
          CustomToast.success("Marco criado!", {
            duration: CustomToastProps.defaultDuration,
          });
        } else {
          throw new Error((res as any).error ?? "Erro ao criar marco");
        }
      } else if (editingMilestone) {
        const res = await updateMilestone(editingMilestone.id, data);
        if (res.status === 200 && res.data) {
          setMilestones((prev) =>
            prev.map((m) => (m.id === editingMilestone.id ? res.data : m))
          );
          setIsMilestoneModalOpen(false);
          setEditingMilestone(null);
          CustomToast.success("Marco atualizado!", {
            duration: CustomToastProps.defaultDuration,
          });
        } else {
          throw new Error((res as any).error ?? "Erro ao atualizar marco");
        }
      }
    } catch (err: any) {
      const msg =
        typeof err?.message === "string" && !err.message.startsWith("<")
          ? err.message
          : "Ocorreu um erro. Tente novamente.";
      CustomToast.error("Erro", {
        description: msg,
        duration: CustomToastProps.defaultDuration,
      });
    } finally {
      setIsMilestoneSubmitting(false);
    }
  };

  const handleDeleteMilestone = async (milestone: any) => {
    setIsDeletingMilestone(true);
    try {
      for (const m of milestone.medias ?? []) {
        await deletePostFile(m.public_id, "", m.media_type).catch(console.error);
      }
      await deleteMilestone(milestone.id);
      setMilestones((prev) => prev.filter((m) => m.id !== milestone.id));
      setConfirmModalOpen(false);
      setConfirmAction(null);
      CustomToast.success("Marco excluído!", {
        duration: CustomToastProps.defaultDuration,
      });
    } catch (err: any) {
      const msg =
        typeof err?.message === "string" && !err.message.startsWith("<")
          ? err.message
          : "Ocorreu um erro. Tente novamente.";
      CustomToast.error("Erro ao excluir marco", {
        description: msg,
        duration: CustomToastProps.defaultDuration,
      });
    } finally {
      setIsDeletingMilestone(false);
    }
  };

  const openConfirmModal = (type: string, data: any) => {
    setConfirmAction({ type, data });
    setIsConfirmModalOpen(true);
  };

  const setConfirmModalOpen = (open: boolean) => {
    setIsConfirmModalOpen(open);
    if (!open) setConfirmAction(null);
  };

  const handleDeletePost = async (postId: number) => {
    const post = getPostById(postId);
    setIsDeletingPost(true);
    try {
      await deletePostProfile(postId, post ?? null);
      removePost(postId);
      if (selectedPostId === postId) setSelectedPostId(null);
      onProfileUpdated?.({
        quantity_posts: Math.max(0, (profile?.quantity_posts ?? 1) - 1),
      });
      setConfirmModalOpen(false);
      setConfirmAction(null);
      CustomToast.success("Post excluído!", {
        duration: CustomToastProps.defaultDuration,
      });
    } catch (err: any) {
      CustomToast.error("Erro ao excluir post", {
        description: err?.message ?? "Tente novamente.",
        duration: CustomToastProps.defaultDuration,
      });
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case "deleteComment":
        handleDeleteComment(confirmAction.data.id);
        break;
      case "deletePost":
        handleDeletePost(confirmAction.data.post.id);
        break;
      case "deleteMilestone":
        handleDeleteMilestone(confirmAction.data);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <CustomToaster />
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
                isOwner={isOwner}
                nextPage={nextPage}
                isLoadingMore={isLoadingMore}
                onAddCommentClick={() => setIsAddCommentModalOpen(true)}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                onLoadMore={loadMoreComments}
                openConfirmModal={openConfirmModal}
                setEditingComment={setEditingComment}
                setIsEditCommentModalOpen={setIsEditCommentModalOpen}
                currentUserUsername={user?.username}
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
              <MediaTab
                profile={profile}
                isOwner={isOwner}
                onPostClick={(postId) => setSelectedPostId(postId)}
                onDeletePost={(post) => openConfirmModal("deletePost", { post })}
              />
            </TabsContent>

            <TabsContent value="posts" className="p-6 space-y-4">
              <PostsTab
                profile={profile}
                isOwner={isOwner}
                onPostClick={(postId) => setSelectedPostId(postId)}
                onDeletePost={(post) => openConfirmModal("deletePost", { post })}
              />
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
                isLoading={isLoadingMilestones}
                nextPage={milestonesNextPage}
                isLoadingMore={isLoadingMoreMilestones}
                onLoadMore={loadMoreMilestones}
                isOwner={isOwner}
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
                onMilestoneClick={(milestone) => {
                  setSelectedMilestone(milestone);
                  setIsMilestoneDetailModalOpen(true);
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
          onClose={() => {
            setIsMilestoneModalOpen(false);
            setEditingMilestone(null);
          }}
          onSubmit={handleMilestoneSubmit}
          milestone={editingMilestone}
          mode={milestoneModalMode}
          profileId={profile?.id ?? 0}
          isSubmitting={isMilestoneSubmitting}
        />

        <MilestoneDetailModal
          isOpen={isMilestoneDetailModalOpen}
          onClose={() => {
            setIsMilestoneDetailModalOpen(false);
            setSelectedMilestone(null);
          }}
          milestone={selectedMilestone}
        />

        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={handleConfirmAction}
          isConfirming={
            (confirmAction?.type === "deleteComment" && isDeletingComment) ||
            (confirmAction?.type === "deletePost" && isDeletingPost) ||
            (confirmAction?.type === "deleteMilestone" && isDeletingMilestone)
          }
          title={
            confirmAction?.type === "deleteComment"
              ? "Excluir Comentário"
              : confirmAction?.type === "deletePost"
                ? "Excluir Post"
                : confirmAction?.type === "deleteMilestone"
                  ? "Excluir Marco"
                  : ""
          }
          description={
            confirmAction?.type === "deleteComment"
              ? "Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita."
              : confirmAction?.type === "deletePost"
                ? "Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita."
                : confirmAction?.type === "deleteMilestone"
                  ? "Tem certeza que deseja excluir este marco? Esta ação não pode ser desfeita."
                  : ""
          }
          confirmText={
            confirmAction?.type?.includes("delete") ? "Excluir" : "Adicionar"
          }
          destructive={confirmAction?.type?.includes("delete")}
        />

        <EditCommentModal
          isOpen={isEditCommentModalOpen}
          onClose={() => {
            setIsEditCommentModalOpen(false);
            setEditingComment(null);
          }}
          onSubmit={(newContent) =>
            editingComment && handleEditComment(editingComment.id, newContent)
          }
          initialComment={editingComment?.content ?? editingComment?.comment ?? ""}
          isSubmitting={isEditCommentSubmitting}
        />

        <AddCommentModal
          isOpen={isAddCommentModalOpen}
          onClose={() => setIsAddCommentModalOpen(false)}
          onSubmit={handleAddComment}
          isSubmitting={isAddCommentSubmitting}
        />

        <ProfilePostModal
          postId={selectedPostId}
          open={selectedPostId !== null}
          onClose={() => setSelectedPostId(null)}
        />
      </div>
    </>
  );
}
