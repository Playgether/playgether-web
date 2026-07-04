"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { GamesCanvasUserProfile } from "./GamesCanvasUserProfile";
import { cn } from "@/lib/utils";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const postsContext = useProfilePostsContext();
  const { removePost, getPostById } = postsContext;
  const isOwner = Boolean(
    user &&
      profile &&
      ((typeof user.user_id === "number" &&
        typeof profile.user_id === "number" &&
        user.user_id === profile.user_id) ||
        user.username.toLowerCase() === profile.username.toLowerCase())
  );

  const tabIdToSlug: Record<string, string> = {
    bio: "bio",
    media: "midias",
    posts: "textos",
    "game-stats": "estatisticas",
    milestones: "marcos",
    achievements: "conquistas",
    games: "biblioteca",
  };

  const slugToTabId: Record<string, string> = Object.fromEntries(
    Object.entries(tabIdToSlug).map(([k, v]) => [v, k])
  );

  const normalizeSlug = (value: string) =>
    value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

  const getTabFromPathname = () => {
    const parts = (pathname ?? "").split("/").filter(Boolean);
    // /profile
    if (parts.length === 1 && parts[0] === "profile") return "bio";
    // /profile/<tab>
    if (parts.length === 2 && parts[0] === "profile") {
      return slugToTabId[normalizeSlug(parts[1])] ?? "bio";
    }
    // /profile/<username>/<tab>
    if (parts.length === 3 && parts[0] === "profile") {
      return slugToTabId[normalizeSlug(parts[2])] ?? "bio";
    }
    return "bio";
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromPathname());
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

  // Sincroniza a aba com a URL (para permitir acesso direto /profile/<tab>).
  useEffect(() => {
    setActiveTab(getTabFromPathname());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Mostra toaster quando o backend redireciona com erro (apenas uma vez por carga).
  const didToastSteamErrorRef = useRef(false);
  useEffect(() => {
    const steamError = searchParams?.get("steam_error");
    if (!steamError) return;
    if (didToastSteamErrorRef.current) return;

    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const raw = document.cookie ?? "";
      if (!raw) return null;
      // parsing simples (sem RegExp) para evitar problemas de escape no build
      const parts = raw.split("; ").map((p) => p.trim());
      for (const part of parts) {
        const [k, ...rest] = part.split("=");
        if (k === name) return decodeURIComponent(rest.join("="));
      }
      return null;
    };

    // Proteção contra o usuário digitar manualmente `?steam_error=...`.
    // O backend seta um cookie efêmero quando o erro realmente aconteceu.
    const toastCookie = getCookie("steam_error_toast");
    if (!toastCookie || toastCookie !== steamError) return;

    // Limpa para garantir idempotência (mesmo se a página re-renderizar).
    document.cookie = "steam_error_toast=; Max-Age=0; path=/";

    didToastSteamErrorRef.current = true;
    if (steamError === "steam_already_associated") {
      CustomToast.error("Essa conta Steam já está associada a outra conta.", {
        duration: CustomToastProps.defaultDuration,
      });
    } else if (steamError === "steam_rate_limited") {
      CustomToast.error(
        "Muitas tentativas. Aguarde alguns minutos antes de tentar conectar a Steam novamente.",
        {
          duration: CustomToastProps.defaultDuration,
        }
      );
    } else {
      CustomToast.error("Falha ao conectar Steam.", {
        description: `Erro: ${steamError}`,
        duration: CustomToastProps.defaultDuration,
      });
    }
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("steam_error");
    const newSearch = params.toString();
    const basePath = pathname ?? "";
    const newUrl = newSearch ? `${basePath}?${newSearch}` : basePath;
    router.replace(newUrl, { scroll: false });
  }, [searchParams, pathname, router]);

  useEffect(() => {
    const steamConnected = searchParams?.get("steam_connected");
    if (steamConnected !== "1") return;

    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("steam_connected");
    const newSearch = params.toString();
    const basePath = pathname ?? "";
    const newUrl = newSearch ? `${basePath}?${newSearch}` : basePath;
    router.replace(newUrl, { scroll: false });
  }, [searchParams, pathname, router]);

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
    medias: { media_url: string; media_type: "image" | "video"; public_id: string }[];
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
        <Tabs
          value={activeTab}
          onValueChange={(nextValue) => {
            if (nextValue === activeTab) return;
            setActiveTab(nextValue);
            if (!profile) return;
            const basePath = isOwner
              ? "/profile"
              : `/profile/${profile.username}`;
            const desiredPath =
              nextValue === "bio"
                ? basePath
                : `${basePath}/${tabIdToSlug[nextValue] ?? "bio"}`;

            // Atualiza SOMENTE o texto da URL (sem navegação do Next),
            // para evitar disparar o `loading.tsx` ao trocar de aba.
            if (typeof window !== "undefined" && pathname !== desiredPath) {
              const currentSearch = searchParams?.toString() ?? "";
              const nextUrl = desiredPath + (currentSearch ? `?${currentSearch}` : "");
              window.history.replaceState(null, "", nextUrl);
            }
          }}
          className="w-full min-w-0"
        >
          <div className="sticky top-[var(--layout-header-height)] z-10 bg-background/95 backdrop-blur-sm lg:static lg:z-auto lg:bg-transparent lg:backdrop-blur-none">
            {/* Mobile: perfil + abas — sem bordas arredondadas para evitar vãos na junção */}
            <div className="border border-border bg-card shadow-card lg:hidden">
              <GamesCanvasUserProfile
                profile={profile}
                variant="compact"
                embedded
                onProfileUpdated={onProfileUpdated}
              />
              <TabsList className="!flex h-auto w-full min-w-0 flex-row gap-0 rounded-none border-0 border-t border-border/50 bg-muted/20 p-0">
                {tabsData.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    title={tab.label}
                    className={cn(
                      "flex h-9 min-h-0 min-w-0 flex-1 basis-0 flex-col items-center justify-center rounded-none border-b-2 border-transparent !px-0 py-0 transition-colors",
                      "data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none",
                    )}
                  >
                    <tab.icon className="h-4 w-4 shrink-0" />
                    <span className="sr-only">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Desktop: abas separadas — largura total distribuída entre os itens */}
            <TabsList className="mb-6 hidden h-auto w-full gap-1 border border-border bg-card p-1 lg:!flex lg:flex-row">
              {tabsData.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex h-auto min-w-0 flex-1 basis-0 flex-col items-center gap-1 p-3 transition-all duration-200 data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-neon"
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap text-xs">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-3 overflow-visible rounded-lg border border-border bg-card shadow-card lg:mt-0">
            <TabsContent value="bio" className="space-y-4 p-4 sm:p-6">
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

            <TabsContent value="game-stats" className="p-4 sm:p-6">
              <GameStatsTab
                profile={profile}
                selectedGame={selectedGame}
                setSelectedGame={setSelectedGame}
                isOwner={isOwner}
              />
            </TabsContent>

            <TabsContent value="media" className="p-4 sm:p-6">
              <MediaTab
                profile={profile}
                isOwner={isOwner}
                onPostClick={(postId) => setSelectedPostId(postId)}
                onDeletePost={(post) => openConfirmModal("deletePost", { post })}
              />
            </TabsContent>

            <TabsContent value="posts" className="space-y-4 p-4 sm:p-6">
              <PostsTab
                profile={profile}
                isOwner={isOwner}
                onPostClick={(postId) => setSelectedPostId(postId)}
                onDeletePost={(post) => openConfirmModal("deletePost", { post })}
              />
            </TabsContent>

            <TabsContent value="achievements" className="overflow-visible p-4 sm:p-6">
              <AchievementsTab
                profile={profile}
                isOwner={isOwner}
                onProfileUpdated={onProfileUpdated}
                onAchievementClick={(achievement) => {
                  setSelectedAchievement(achievement);
                  setIsAchievementModalOpen(true);
                }}
              />
            </TabsContent>

            <TabsContent value="milestones" className="p-4 sm:p-6">
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

            <TabsContent value="games" className="p-4 sm:p-6">
              <GamesLibraryTab profile={profile} isOwner={isOwner} />
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
