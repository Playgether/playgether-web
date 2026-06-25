"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, Gamepad2, MessageSquare, Hash, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { resolveGameMediaUrl } from "@/app/utils/getCloudinaryUrl";
import {
  searchGlobal,
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  type GlobalSearchResults,
} from "@/services/searchGlobal";
import { getGames, type GameDetails } from "@/services/getGames";

// ─── helpers ────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function timeAgo(timestamp: string): string {
  try {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  } catch {
    return "";
  }
}

// ─── sub-components ─────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {children}
    </p>
  );
}

function ResultRow({
  icon,
  label,
  sublabel,
  onClick,
  onRemove,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
  onRemove?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors text-left group"
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium truncate">{label}</span>
        {sublabel && (
          <span className="block text-xs text-muted-foreground truncate">{sublabel}</span>
        )}
      </span>
      {onRemove && (
        <span
          role="button"
          aria-label="Remover pesquisa"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </span>
      )}
    </button>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export function GlobalSearchDropdown() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResults | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularGames, setPopularGames] = useState<GameDetails[]>([]);

  const debouncedQuery = useDebounce(query.trim(), 300);

  // Load recent searches and popular games when dropdown opens
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      getGames()
        .then((games) => setPopularGames(games.slice(0, 5)))
        .catch(() => {});
    }
  }, [open]);

  // Run search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    searchGlobal(debouncedQuery)
      .then((data) => {
        setResults(data);
      })
      .catch(() => {
        setResults({ users: [], games: [], rooms: [], posts: [] });
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Close on ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = useCallback(
    (href: string, searchTerm?: string) => {
      if (searchTerm) addRecentSearch(searchTerm);
      setOpen(false);
      setQuery("");
      setResults(null);
      router.push(href);
    },
    [router]
  );

  const handleRecentClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const handleRemoveRecent = (term: string) => {
    removeRecentSearch(term);
    setRecentSearches(getRecentSearches());
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const hasResults =
    results &&
    (results.users.length > 0 ||
      results.games.length > 0 ||
      results.rooms.length > 0 ||
      results.posts.length > 0);

  const isSearching = debouncedQuery.length >= 2;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim().length >= 2) {
              e.preventDefault();
              addRecentSearch(query.trim());
              setOpen(false);
              setQuery("");
              setResults(null);
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            }
          }}
          placeholder="Pesquisar"
          className="pl-12 h-11 bg-muted/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/30 transition-all duration-300"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults(null);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Limpar busca"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden max-h-[480px] flex flex-col">
          <div className="overflow-y-auto flex-1">

            {/* ── Loading ── */}
            {loading && (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Buscando...</span>
              </div>
            )}

            {/* ── Search results ── */}
            {!loading && isSearching && results && (
              <>
                {!hasResults && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                    <Search className="w-8 h-8 opacity-30" />
                    <p className="text-sm">
                      Nenhum resultado encontrado para &ldquo;{debouncedQuery}&rdquo;
                    </p>
                  </div>
                )}

                {/* Users */}
                {results.users.length > 0 && (
                  <>
                    <SectionTitle>Usuários</SectionTitle>
                    {results.users.map((user) => (
                      <ResultRow
                        key={user.username}
                        icon={
                          <ProfileAvatar
                            displayName={user.name}
                            username={user.username}
                            profilePhoto={user.profile_photo}
                            sizeClass="h-8 w-8"
                          />
                        }
                        label={user.name}
                        sublabel={`@${user.username}`}
                        onClick={() =>
                          navigate(`/profile/${user.username}`, debouncedQuery)
                        }
                      />
                    ))}
                  </>
                )}

                {/* Games */}
                {results.games.length > 0 && (
                  <>
                    <SectionTitle>Jogos</SectionTitle>
                    {results.games.map((game) => (
                      <ResultRow
                        key={game.id}
                        icon={
                          <GameIcon icon={game.icon} name={game.name} />
                        }
                        label={game.name}
                        sublabel={game.acronym || undefined}
                        onClick={() =>
                          navigate(`/rooms?game=${game.id}`, debouncedQuery)
                        }
                      />
                    ))}
                  </>
                )}

                {/* Rooms / Clans */}
                {results.rooms.length > 0 && (
                  <>
                    <SectionTitle>Salas</SectionTitle>
                    {results.rooms.map((room) => (
                      <ResultRow
                        key={room.id}
                        icon={
                          <RoomIcon banner={room.banner} name={room.group_name} />
                        }
                        label={room.group_name}
                        sublabel={
                          room.peak_users
                            ? `${room.peak_users} membros`
                            : undefined
                        }
                        onClick={() =>
                          navigate(`/rooms/${room.slug}`, debouncedQuery)
                        }
                      />
                    ))}
                  </>
                )}

                {/* Posts */}
                {results.posts.length > 0 && (
                  <>
                    <SectionTitle>Posts</SectionTitle>
                    {results.posts.map((post) => (
                      <ResultRow
                        key={post.id}
                        icon={
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        }
                        label={post.comment || "(sem texto)"}
                        sublabel={`@${post.username} · ${timeAgo(post.timestamp)}`}
                        onClick={() =>
                          navigate(`/profile/${post.username}`, debouncedQuery)
                        }
                      />
                    ))}
                  </>
                )}
              </>
            )}

            {/* ── Empty state (no query) ── */}
            {!loading && !isSearching && (
              <>
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-4 pt-3 pb-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Pesquisas recentes
                      </p>
                      <button
                        type="button"
                        onClick={handleClearRecent}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Limpar
                      </button>
                    </div>
                    {recentSearches.map((term) => (
                      <ResultRow
                        key={term}
                        icon={
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        }
                        label={term}
                        onClick={() => handleRecentClick(term)}
                        onRemove={() => handleRemoveRecent(term)}
                      />
                    ))}
                  </>
                )}

                {/* Popular games */}
                {popularGames.length > 0 && (
                  <>
                    <SectionTitle>Jogos populares</SectionTitle>
                    {popularGames.map((game) => (
                      <ResultRow
                        key={game.id}
                        icon={
                          <GameIcon icon={game.icon} name={game.name} />
                        }
                        label={game.name}
                        sublabel={game.acronym || undefined}
                        onClick={() => navigate(`/rooms?game=${game.id}`)}
                      />
                    ))}
                  </>
                )}

                {recentSearches.length === 0 && popularGames.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                    <Search className="w-8 h-8 opacity-30" />
                    <p className="text-sm">
                      Digite para pesquisar usuários, jogos, salas e posts
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── icon helpers ─────────────────────────────────────────────────────────────

function GameIcon({ icon, name }: { icon: string | null; name: string }) {
  const src = icon ? resolveGameMediaUrl(icon) : null;
  return (
    <div className="w-8 h-8 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <Gamepad2 className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  );
}

function RoomIcon({ banner, name }: { banner: string | null; name: string }) {
  const src = banner ? resolveGameMediaUrl(banner) : null;
  return (
    <div className="w-8 h-8 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <Hash className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  );
}
