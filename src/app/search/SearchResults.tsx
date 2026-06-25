"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Users,
  FileText,
  Hash,
  Gamepad2,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Repeat2,
  BadgeCheck,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { resolveGameMediaUrl } from "@/app/utils/getCloudinaryUrl";
import {
  searchGlobal,
  type GlobalSearchResults,
  type SearchUser,
  type SearchPost,
  type SearchRoom,
  type SearchGame,
} from "@/services/searchGlobal";
import { cn } from "@/lib/utils";
import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── types ───────────────────────────────────────────────────────────────────

type Tab = "principais" | "pessoas" | "posts" | "salas" | "jogos" | "midia";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "principais", label: "Principais", icon: <Search className="w-4 h-4" /> },
  { id: "pessoas", label: "Pessoas", icon: <Users className="w-4 h-4" /> },
  { id: "posts", label: "Posts", icon: <FileText className="w-4 h-4" /> },
  { id: "midia", label: "Mídia", icon: <ImageIcon className="w-4 h-4" /> },
  { id: "salas", label: "Salas", icon: <Hash className="w-4 h-4" /> },
  { id: "jogos", label: "Jogos", icon: <Gamepad2 className="w-4 h-4" /> },
];

const PAGE_SIZE = 20;

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function timeAgo(ts: string): string {
  try {
    return formatDistanceToNowStrict(new Date(ts), { locale: ptBR, addSuffix: false });
  } catch {
    return "";
  }
}

// ─── sub-cards ───────────────────────────────────────────────────────────────

function UserCard({ user, onClick }: { user: SearchUser; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/40 transition-colors text-left border-b border-border/30 last:border-0"
    >
      <ProfileAvatar
        displayName={user.name}
        username={user.username}
        profilePhoto={user.profile_photo}
        sizeClass="h-12 w-12"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold truncate">{user.name}</span>
          {user.verified && (
            <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
      </div>
    </button>
  );
}

function PostCard({ post, onClick }: { post: SearchPost; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex gap-3 px-4 py-4 hover:bg-muted/40 transition-colors text-left border-b border-border/30 last:border-0"
    >
      <ProfileAvatar
        displayName={post.name}
        username={post.username}
        profilePhoto={post.profile_photo}
        sizeClass="h-10 w-10 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm truncate">{post.name}</span>
          <span className="text-xs text-muted-foreground shrink-0">@{post.username}</span>
          <span className="text-xs text-muted-foreground shrink-0">·</span>
          <span className="text-xs text-muted-foreground shrink-0">{timeAgo(post.timestamp)}</span>
        </div>
        <p className="text-sm text-foreground/90 line-clamp-3 break-words">{post.comment}</p>
        {post.has_post_media && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
            <ImageIcon className="w-3.5 h-3.5" />Mídia
          </span>
        )}
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />{formatCount(post.quantity_likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />{formatCount(post.quantity_comment)}
          </span>
          <span className="flex items-center gap-1">
            <Repeat2 className="w-3.5 h-3.5" />{formatCount(post.quantity_reposts)}
          </span>
        </div>
      </div>
    </button>
  );
}

function RoomCard({ room, onClick }: { room: SearchRoom; onClick: () => void }) {
  const src = room.banner ? resolveGameMediaUrl(room.banner) : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/40 transition-colors text-left border-b border-border/30 last:border-0"
    >
      <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={room.group_name} className="w-full h-full object-cover" />
        ) : (
          <Hash className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{room.group_name}</p>
        {room.peak_users > 0 && (
          <p className="text-xs text-muted-foreground">{room.peak_users} membros</p>
        )}
        {room.summary && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">{room.summary}</p>
        )}
      </div>
    </button>
  );
}

function GameCard({ game, onClick }: { game: SearchGame; onClick: () => void }) {
  const src = game.icon ? resolveGameMediaUrl(game.icon) : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/40 transition-colors text-left border-b border-border/30 last:border-0"
    >
      <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={game.name} className="w-full h-full object-cover" />
        ) : (
          <Gamepad2 className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{game.name}</p>
        {game.acronym && <p className="text-xs text-muted-foreground">{game.acronym}</p>}
      </div>
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="px-4 pt-5 pb-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
      {title}
    </p>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
      <Search className="w-12 h-12 opacity-20" />
      <p className="text-base">Nenhum resultado para &ldquo;{query}&rdquo;</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span>Buscando...</span>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function SearchResults() {
  const searchParamsRaw = useSearchParams();
  const searchParams = searchParamsRaw!;
  const router = useRouter();
  const q = searchParams.get("q") ?? "";
  const tabParam = (searchParams.get("tab") ?? "principais") as Tab;

  const [activeTab, setActiveTab] = useState<Tab>(tabParam);
  const [results, setResults] = useState<GlobalSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setResults(null);
    setOffset(0);
    setHasMore(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  const typeForTab = (tab: Tab): "all" | "users" | "posts" | "rooms" | "games" => {
    if (tab === "pessoas") return "users";
    if (tab === "posts") return "posts";
    if (tab === "midia") return "posts";
    if (tab === "salas") return "rooms";
    if (tab === "jogos") return "games";
    return "all";
  };

  const fetch = useCallback(
    async (tab: Tab, currentOffset: number, append: boolean) => {
      if (!q || q.length < 2) return;

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const isAll = tab === "principais";
      const limit = isAll ? 5 : PAGE_SIZE;

      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const data = await searchGlobal(q, {
          type: typeForTab(tab),
          limit,
          offset: currentOffset,
          has_media: tab === "midia",
        });

        if (append) {
          setResults((prev) =>
            prev
              ? {
                  users: [...prev.users, ...data.users],
                  games: [...prev.games, ...data.games],
                  rooms: [...prev.rooms, ...data.rooms],
                  posts: [...prev.posts, ...data.posts],
                }
              : data
          );
        } else {
          setResults(data);
        }

        // hasMore só faz sentido em tabs específicas (não "principais")
        if (!isAll) {
          const count =
            data.users.length + data.games.length + data.rooms.length + data.posts.length;
          setHasMore(count === limit);
        } else {
          setHasMore(false);
        }
      } catch {
        // ignore aborted requests
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [q]
  );

  // Initial fetch when q or tab changes
  useEffect(() => {
    setResults(null);
    setOffset(0);
    setHasMore(false);
    setActiveTab(tabParam);
    void fetch(tabParam, 0, false);
  }, [q, tabParam, fetch]);

  const handleLoadMore = () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    void fetch(activeTab, newOffset, true);
  };

  const navigate = (href: string) => router.push(href);

  // ── render ────────────────────────────────────────────────────────────────

  const hasResults =
    results &&
    (results.users.length > 0 ||
      results.games.length > 0 ||
      results.rooms.length > 0 ||
      results.posts.length > 0);

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Header */}
      {q && (
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-xl font-bold">
            Resultados para{" "}
            <span className="text-primary">&ldquo;{q}&rdquo;</span>
          </h1>
        </div>
      )}

      {/* Tab bar */}
      <div className="sticky top-[var(--layout-header-height)] z-20 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div className="flex overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 shrink-0",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pb-8">
        {!q || q.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Search className="w-12 h-12 opacity-20" />
            <p className="text-base">Digite algo para pesquisar</p>
          </div>
        ) : loading ? (
          <LoadingState />
        ) : !hasResults ? (
          <EmptyState query={q} />
        ) : (
          <>
            {/* ── PRINCIPAIS ── */}
            {activeTab === "principais" && results && (
              <>
                {results.users.length > 0 && (
                  <div>
                    <SectionHeader title="Pessoas" />
                    <div className="bg-card/40 rounded-xl mx-4 overflow-hidden border border-border/30">
                      {results.users.map((u) => (
                        <UserCard
                          key={u.username}
                          user={u}
                          onClick={() => navigate(`/profile/${u.username}`)}
                        />
                      ))}
                    </div>
                    {results.users.length === 5 && (
                      <button
                        type="button"
                        onClick={() => switchTab("pessoas")}
                        className="w-full text-sm text-primary hover:underline py-2 px-4 text-left"
                      >
                        Ver mais pessoas →
                      </button>
                    )}
                  </div>
                )}

                {results.posts.length > 0 && (
                  <div>
                    <SectionHeader title="Posts" />
                    <div className="bg-card/40 rounded-xl mx-4 overflow-hidden border border-border/30">
                      {results.posts.map((p) => (
                        <PostCard
                          key={p.id}
                          post={p}
                          onClick={() => navigate(`/feed/${p.id}`)}
                        />
                      ))}
                    </div>
                    {results.posts.length === 5 && (
                      <button
                        type="button"
                        onClick={() => switchTab("posts")}
                        className="w-full text-sm text-primary hover:underline py-2 px-4 text-left"
                      >
                        Ver mais posts →
                      </button>
                    )}
                  </div>
                )}

                {results.rooms.length > 0 && (
                  <div>
                    <SectionHeader title="Salas" />
                    <div className="bg-card/40 rounded-xl mx-4 overflow-hidden border border-border/30">
                      {results.rooms.map((r) => (
                        <RoomCard
                          key={r.id}
                          room={r}
                          onClick={() => navigate(`/rooms/${r.slug}`)}
                        />
                      ))}
                    </div>
                    {results.rooms.length === 5 && (
                      <button
                        type="button"
                        onClick={() => switchTab("salas")}
                        className="w-full text-sm text-primary hover:underline py-2 px-4 text-left"
                      >
                        Ver mais salas →
                      </button>
                    )}
                  </div>
                )}

                {results.games.length > 0 && (
                  <div>
                    <SectionHeader title="Jogos" />
                    <div className="bg-card/40 rounded-xl mx-4 overflow-hidden border border-border/30">
                      {results.games.map((g) => (
                        <GameCard
                          key={g.id}
                          game={g}
                          onClick={() => navigate(`/rooms?game=${g.id}`)}
                        />
                      ))}
                    </div>
                    {results.games.length === 5 && (
                      <button
                        type="button"
                        onClick={() => switchTab("jogos")}
                        className="w-full text-sm text-primary hover:underline py-2 px-4 text-left"
                      >
                        Ver mais jogos →
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ── PESSOAS ── */}
            {activeTab === "pessoas" && results && (
              <div className="bg-card/40 rounded-xl mx-4 mt-4 overflow-hidden border border-border/30">
                {results.users.map((u) => (
                  <UserCard
                    key={u.username}
                    user={u}
                    onClick={() => navigate(`/profile/${u.username}`)}
                  />
                ))}
              </div>
            )}

            {/* ── POSTS ── */}
            {activeTab === "posts" && results && (
              <div className="bg-card/40 rounded-xl mx-4 mt-4 overflow-hidden border border-border/30">
                {results.posts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    onClick={() => navigate(`/feed/${p.id}`)}
                  />
                ))}
              </div>
            )}

            {/* ── MÍDIA ── */}
            {activeTab === "midia" && results && (
              <div className="bg-card/40 rounded-xl mx-4 mt-4 overflow-hidden border border-border/30">
                {results.posts.length > 0 ? (
                  results.posts.map((p) => (
                    <PostCard
                      key={p.id}
                      post={p}
                      onClick={() => navigate(`/feed/${p.id}`)}
                    />
                  ))
                ) : (
                  <EmptyState query={q} />
                )}
              </div>
            )}

            {/* ── SALAS ── */}
            {activeTab === "salas" && results && (
              <div className="bg-card/40 rounded-xl mx-4 mt-4 overflow-hidden border border-border/30">
                {results.rooms.map((r) => (
                  <RoomCard
                    key={r.id}
                    room={r}
                    onClick={() => navigate(`/rooms/${r.slug}`)}
                  />
                ))}
              </div>
            )}

            {/* ── JOGOS ── */}
            {activeTab === "jogos" && results && (
              <div className="bg-card/40 rounded-xl mx-4 mt-4 overflow-hidden border border-border/30">
                {results.games.map((g) => (
                  <GameCard
                    key={g.id}
                    game={g}
                    onClick={() => navigate(`/rooms?game=${g.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Load more */}
            {activeTab !== "principais" && hasMore && (
              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-border/50 text-sm font-medium hover:bg-muted/60 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  Carregar mais
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
