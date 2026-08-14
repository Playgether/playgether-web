"use client";

import { useCallback, useEffect, useState } from "react";
import { Bookmark, FolderOpen, Plus, Loader2, ArrowLeft, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import type { PostProps } from "@/app/feed/types/PostProps";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import { CustomToast } from "@/components/ui/customSonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CldImage } from "next-cloudinary";
import { useProfilePostsContext } from "@/app/profile/context/ProfilePostsContext";

interface Collection {
  id: number;
  name: string;
  post_count: number;
  cover_media: string | null;
  cover_post_id: number | null;
}

type View = { type: "grid" } | { type: "all" } | { type: "collection"; collection: Collection };

async function fetchSavedPosts(cursor: string | null) {
  const params = new URLSearchParams({ page_size: "12" });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/saved-posts?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao carregar posts salvos");
  return res.json() as Promise<{ data: PostProps[]; next_page: string | null }>;
}

async function fetchCollectionPosts(id: number, cursor: string | null) {
  const params = new URLSearchParams({ page_size: "12" });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/collections/${id}?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao carregar coleção");
  return res.json() as Promise<{ data: PostProps[]; next_page: string | null }>;
}

async function fetchCollections(): Promise<Collection[]> {
  const res = await fetch("/api/collections", { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

interface SavedPostsTabProps {
  onPostClick: (postId: number) => void;
}

export function SavedPostsTab({ onPostClick }: SavedPostsTabProps) {
  const [view, setView] = useState<View>({ type: "grid" });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadCollections = useCallback(async () => {
    setLoadingCollections(true);
    try {
      const data = await fetchCollections();
      setCollections(data);
    } finally {
      setLoadingCollections(false);
    }
  }, []);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  const handleCreateCollection = async () => {
    if (!newName.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        const newCol: Collection = { id: data.id, name: data.name, post_count: 0, cover_media: null, cover_post_id: null };
        setCollections((prev) => [newCol, ...prev]);
        setNewName("");
        setCreatingNew(false);
        CustomToast.success(`Coleção "${data.name}" criada!`);
      }
    } catch {
      CustomToast.error("Erro ao criar coleção.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCollection = async (col: Collection) => {
    try {
      const res = await fetch(`/api/collections/${col.id}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setCollections((prev) => prev.filter((c) => c.id !== col.id));
        if (view.type === "collection" && view.collection.id === col.id) {
          setView({ type: "grid" });
        }
        CustomToast.neutral(`Coleção "${col.name}" excluída.`);
      }
    } catch {
      CustomToast.error("Erro ao excluir coleção.");
    }
  };

  if (view.type === "all") {
    return (
      <PostListView
        title="Todos os posts"
        fetchFn={(cursor) => fetchSavedPosts(cursor)}
        onBack={() => setView({ type: "grid" })}
        onPostClick={onPostClick}
      />
    );
  }

  if (view.type === "collection") {
    return (
      <PostListView
        title={view.collection.name}
        fetchFn={(cursor) => fetchCollectionPosts(view.collection.id, cursor)}
        onBack={() => setView({ type: "grid" })}
        onPostClick={onPostClick}
        onDeleteCollection={() => handleDeleteCollection(view.collection)}
      />
    );
  }

  // Grid view: collections + "todos os posts" card
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Somente você pode ver o que salvou</p>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-primary gap-1.5"
          onClick={() => setCreatingNew((v) => !v)}
        >
          <Plus className="h-3.5 w-3.5" />
          Nova coleção
        </Button>
      </div>

      {creatingNew && (
        <div className="flex gap-2 p-3 rounded-xl bg-muted/50 border border-border/40">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da coleção"
            className="h-8 text-sm bg-background/50"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
          />
          <Button
            size="sm"
            className="h-8 bg-gradient-primary text-white shrink-0"
            onClick={handleCreateCollection}
            disabled={isCreating || !newName.trim()}
          >
            {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Criar"}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 shrink-0" onClick={() => { setCreatingNew(false); setNewName(""); }}>
            Cancelar
          </Button>
        </div>
      )}

      {loadingCollections ? (
        <div className="flex justify-center py-10">
          <LoadingComponent showText={false} className="h-8 w-8" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* "Todos os posts" card always first */}
          <CollectionCard
            name="Todos os posts"
            coverMedia={collections[0]?.cover_media ?? null}
            postCount={collections.reduce((a, c) => a + c.post_count, 0)}
            onClick={() => setView({ type: "all" })}
          />

          {collections.map((col) => (
            <div key={col.id} className="relative group">
              <CollectionCard
                name={col.name}
                coverMedia={col.cover_media}
                postCount={col.post_count}
                onClick={() => setView({ type: "collection", collection: col })}
              />
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500 focus:bg-destructive/10"
                      onClick={(e) => { e.stopPropagation(); handleDeleteCollection(col); }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Excluir coleção
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {collections.length === 0 && (
            <button
              onClick={() => setCreatingNew(true)}
              className="aspect-square rounded-xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Plus className="h-6 w-6" />
              <span className="text-xs">Nova coleção</span>
            </button>
          )}
        </div>
      )}

      {!loadingCollections && collections.length === 0 && (
        <div className="flex flex-col items-center py-12 gap-3 text-muted-foreground">
          <Bookmark className="h-10 w-10 opacity-30" />
          <p className="text-sm">Você ainda não salvou nenhum post.</p>
          <p className="text-xs text-center">Clique no ícone de bookmark em qualquer post para salvar.</p>
        </div>
      )}
    </div>
  );
}

function CollectionCard({
  name,
  coverMedia,
  postCount,
  onClick,
}: {
  name: string;
  coverMedia: string | null;
  postCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl overflow-hidden border border-border/40 hover:border-primary/40 transition-all hover:shadow-md"
    >
      <div className="aspect-square relative bg-muted/60 overflow-hidden">
        {coverMedia ? (
          <CldImage
            src={coverMedia}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-sm font-semibold truncate drop-shadow">{name}</p>
          <p className="text-white/70 text-xs">{postCount} post{postCount !== 1 ? "s" : ""}</p>
        </div>
      </div>
    </button>
  );
}

function PostListView({
  title,
  fetchFn,
  onBack,
  onPostClick,
  onDeleteCollection,
}: {
  title: string;
  fetchFn: (cursor: string | null) => Promise<{ data: PostProps[]; next_page: string | null }>;
  onBack: () => void;
  onPostClick: (postId: number) => void;
  onDeleteCollection?: () => void;
}) {
  const { injectPost } = useProfilePostsContext();
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchFn(null)
      .then((res) => { setPosts(res.data); setNextPage(res.next_page); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleLoadMore = async () => {
    if (!nextPage || isLoadingMore) return;
    let cursor: string | null = null;
    try {
      const url = nextPage.startsWith("http") ? nextPage : `http://dummy/${nextPage}`;
      cursor = new URL(url).searchParams.get("cursor");
    } catch { cursor = null; }
    if (!cursor) return;
    setIsLoadingMore(true);
    try {
      const res = await fetchFn(cursor);
      setPosts((prev) => [...prev, ...res.data]);
      setNextPage(res.next_page);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handlePostClick = (post: PostProps) => {
    injectPost(post);
    onPostClick(post.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {onDeleteCollection ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
            onClick={onDeleteCollection}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir
          </Button>
        ) : <div className="w-16" />}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingComponent showText={false} className="h-8 w-8" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-3 text-muted-foreground">
          <Bookmark className="h-10 w-10 opacity-30" />
          <p className="text-sm">Nenhum post salvo aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <SavedPostCard key={post.id} post={post} onClick={() => handlePostClick(post)} />
          ))}
        </div>
      )}

      {nextPage && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={handleLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <LoadingComponent showText={false} className="h-4 w-4" />
                Carregando...
              </span>
            ) : "Carregar mais"}
          </Button>
        </div>
      )}
    </div>
  );
}

function SavedPostCard({ post, onClick }: { post: PostProps; onClick: () => void }) {
  const truncated = post.comment && post.comment.length > 180
    ? post.comment.slice(0, 180) + "..."
    : post.comment;

  const firstMedia = post.medias?.[0];

  return (
    <div
      className="flex gap-3 p-3 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-muted/40 cursor-pointer transition-all"
      onClick={onClick}
    >
      {firstMedia && (
        <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
          <CldImage
            src={firstMedia.media_file}
            alt=""
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <ProfileAvatar
            displayName={post.name ?? ""}
            username={post.username ?? ""}
            profilePhoto={post.profile_photo ?? null}
            sizeClass="h-6 w-6"
            fallbackTextClassName="text-[10px]"
          />
          <span className="text-xs font-medium text-foreground truncate">{post.name || post.username}</span>
          <span className="text-xs text-muted-foreground ml-auto shrink-0">
            <DateAndHour date={post.timestamp} />
          </span>
        </div>
        {truncated && (
          <p className="text-sm text-muted-foreground leading-snug line-clamp-2">{truncated}</p>
        )}
        {!truncated && firstMedia && (
          <p className="text-xs text-muted-foreground italic">Post com mídia</p>
        )}
      </div>
    </div>
  );
}
