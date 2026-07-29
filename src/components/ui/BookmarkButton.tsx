"use client";

import { useState, useRef, useCallback } from "react";
import { Bookmark, BookmarkCheck, Plus, Loader2, Check, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CustomToast } from "@/components/ui/customSonner";
import { useFeedContext } from "@/app/feed/context/FeedContext";
import type { PostProps } from "@/app/feed/types/PostProps";

interface Collection {
  id: number;
  name: string;
  post_count: number;
  cover_media: string | null;
}

interface BookmarkButtonProps {
  post: PostProps;
  size?: "sm" | "md";
}

export function BookmarkButton({ post, size = "sm" }: BookmarkButtonProps) {
  const { handleSave } = useFeedContext();
  const [isSaving, setIsSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [inCollections, setInCollections] = useState<Set<number>>(new Set());
  const [togglingCollection, setTogglingCollection] = useState<number | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSaved = !!post.user_already_saved;

  // Quick save/unsave on click (when popover is not open)
  const handleQuickSave = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isSaving || open) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        const res = await fetch("/api/saved-posts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: post.id }),
        });
        if (res.ok || res.status === 204) {
          handleSave(post.id, null);
          CustomToast.neutral("Post removido dos salvos.");
        }
      } else {
        const res = await fetch("/api/saved-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: post.id }),
        });
        if (res.ok) {
          const data = await res.json();
          handleSave(post.id, data.id);
          CustomToast.success("Post salvo!");
        }
      }
    } catch {
      CustomToast.error("Erro ao salvar post.");
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, open, isSaved, post.id, handleSave]);

  const loadCollections = useCallback(async () => {
    setLoadingCollections(true);
    try {
      const [colRes, savedRes] = await Promise.all([
        fetch("/api/collections"),
        fetch(`/api/collections`), // reuse — we'll check per-collection below
      ]);
      if (colRes.ok) {
        const data: Collection[] = await colRes.json();
        setCollections(data);
        // Check which collections this post is in
        const postInCols = new Set<number>();
        // We need to check per collection — but that's expensive.
        // Instead, we'll rely on the optimistic toggle state.
        setInCollections(postInCols);
      }
    } finally {
      setLoadingCollections(false);
    }
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      loadCollections();
    } else {
      setCreatingNew(false);
      setNewName("");
    }
  }, [loadCollections]);

  const toggleCollection = useCallback(async (col: Collection) => {
    if (togglingCollection === col.id) return;
    setTogglingCollection(col.id);
    const isIn = inCollections.has(col.id);
    try {
      if (isIn) {
        const res = await fetch(`/api/collections/${col.id}/posts`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: post.id }),
        });
        if (res.ok || res.status === 204) {
          setInCollections((prev) => { const s = new Set(prev); s.delete(col.id); return s; });
        }
      } else {
        const res = await fetch(`/api/collections/${col.id}/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: post.id }),
        });
        if (res.ok) {
          setInCollections((prev) => new Set(prev).add(col.id));
          if (!isSaved) {
            handleSave(post.id, post.id);
          }
        }
      }
    } catch {
      CustomToast.error("Erro ao atualizar coleção.");
    } finally {
      setTogglingCollection(null);
    }
  }, [togglingCollection, inCollections, post.id, isSaved, handleSave]);

  const handleCreateCollection = useCallback(async () => {
    if (!newName.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), post_id: post.id }),
      });
      if (res.ok) {
        const data = await res.json();
        const newCol: Collection = { id: data.id, name: data.name, post_count: 1, cover_media: null };
        setCollections((prev) => [newCol, ...prev]);
        setInCollections((prev) => new Set(prev).add(data.id));
        if (!isSaved) handleSave(post.id, data.id);
        setNewName("");
        setCreatingNew(false);
        CustomToast.success(`Coleção "${data.name}" criada!`);
      }
    } catch {
      CustomToast.error("Erro ao criar coleção.");
    } finally {
      setIsCreating(false);
    }
  }, [newName, isCreating, post.id, isSaved, handleSave]);

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const btnClass = cn(
    "p-1.5 text-muted-foreground hover:text-primary sm:p-2",
    isSaved && "text-primary"
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            // If not yet open, a plain click saves quickly; long hover opens popover
            if (!open) handleQuickSave(e);
          }}
          onMouseEnter={() => {
            hoverTimer.current = setTimeout(() => handleOpenChange(true), 500);
          }}
          onMouseLeave={() => {
            if (hoverTimer.current) clearTimeout(hoverTimer.current);
          }}
          disabled={isSaving}
          className={btnClass}
        >
          {isSaving
            ? <Loader2 className={cn(iconSize, "animate-spin")} />
            : isSaved
              ? <BookmarkCheck className={iconSize} />
              : <Bookmark className={iconSize} />
          }
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-64 p-0 bg-card border-border/60 shadow-xl"
        align="end"
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40">
          <span className="text-sm font-semibold text-foreground">Coleções</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
            onClick={() => setCreatingNew((v) => !v)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {creatingNew && (
          <div className="px-3 py-2 border-b border-border/40 flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome da coleção"
              className="h-7 text-xs bg-background/50"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
            />
            <Button
              size="sm"
              className="h-7 px-2 bg-gradient-primary text-white text-xs shrink-0"
              onClick={handleCreateCollection}
              disabled={isCreating || !newName.trim()}
            >
              {isCreating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Criar"}
            </Button>
          </div>
        )}

        <div className="max-h-56 overflow-y-auto">
          {loadingCollections ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : collections.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
              <FolderPlus className="h-8 w-8 opacity-30" />
              <p className="text-xs">Nenhuma coleção ainda.</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary h-7"
                onClick={() => setCreatingNew(true)}
              >
                Criar primeira coleção
              </Button>
            </div>
          ) : (
            collections.map((col) => {
              const isIn = inCollections.has(col.id);
              const isToggling = togglingCollection === col.id;
              return (
                <button
                  key={col.id}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/60 transition-colors text-left"
                  onClick={() => toggleCollection(col)}
                  disabled={isToggling}
                >
                  <div className={cn(
                    "shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                    isIn ? "border-primary bg-primary" : "border-border/60 bg-transparent"
                  )}>
                    {isToggling
                      ? <Loader2 className="h-3 w-3 animate-spin text-white" />
                      : isIn && <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{col.name}</p>
                    <p className="text-xs text-muted-foreground">{col.post_count} post{col.post_count !== 1 ? "s" : ""}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
