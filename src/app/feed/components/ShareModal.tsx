"use client";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MentionTextarea } from "@/components/mentions/MentionTextarea";
import { MentionText } from "@/components/mentions/MentionText";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useFeedServerContext } from "../context/FeedServerContext";
import { useFeedContext } from "../context/FeedContext";
import { useAuthContext } from "@/context/AuthContext";
import { CustomToast } from "@/components/ui/customSonner";

interface ShareModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRepost?: () => void;
  post: any;
  handleShareModal: (action: boolean) => void;
  shareModalOpen: boolean;
}

export const ShareModal = ({
  open,
  onOpenChange,
  onRepost,
  post,
  handleShareModal,
  shareModalOpen,
}: ShareModalProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { Feed } = useFeedServerContext();
  const components = Feed.ServerShareModal.components;
  const icons = Feed.ServerShareModal.icons;
  const { handleRepost } = useFeedContext();
  const { user } = useAuthContext();

  const handleRepostSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reposts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, comment: content || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        handleRepost(post.id, data.id);
        CustomToast.success("Post repostado!");
        setContent("");
        handleShareModal(false);
        if (onRepost) onRepost();
        if (onOpenChange) onOpenChange(false);
      } else {
        const data = await res.json();
        CustomToast.error(data.detail || "Erro ao repostar.");
      }
    } catch {
      CustomToast.error("Erro ao repostar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open ?? shareModalOpen}
      onOpenChange={(open) => {
        handleShareModal(open);
        if (onOpenChange) onOpenChange(open);
      }}
    >
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border border-border/50">
        {components.ShareModalHeader}

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-primary text-white">
                {user?.first_name?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">
                {user ? `${user.first_name} ${user.last_name}` : ""}
              </h3>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
            </div>
          </div>

          {/* Comment Input */}
          <MentionTextarea
            placeholder="Adicione um comentário..."
            value={content}
            onChange={setContent}
            className="min-h-24 resize-none bg-muted/60 border-border/50 focus:border-primary/50"
          />

          {/* Original Post Preview */}
          <Card className="bg-muted/60 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-primary text-white text-xs">
                    {post.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-sm">{post.name}</h4>
                  <p className="text-xs text-muted-foreground">@{post.username}</p>
                </div>
              </div>
              <p className="text-sm text-foreground line-clamp-3">
                <MentionText text={post.comment} />
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end pt-4 border-t border-border/50">
            <Button
              onClick={handleRepostSubmit}
              disabled={isSubmitting}
              className="bg-gradient-primary hover:opacity-90 text-white"
            >
              {icons.Send}
              {isSubmitting ? "Repostando..." : "Repostar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
