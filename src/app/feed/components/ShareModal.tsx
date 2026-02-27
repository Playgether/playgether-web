"use client";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

// Import current user avatar
import avatarRaymond from "@/assets/avatar-raymond.jpg";
import { useFeedServerContext } from "../context/FeedServerContext";

interface ShareModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRepost?: () => void;
  post: any;
  handleShareModal: (action: boolean) => void;
  shareModalOpen: boolean;
}

const currentUser = {
  name: "Raymond Junior",
  username: "raymond",
  avatar: avatarRaymond,
};

export const ShareModal = ({
  open,
  onOpenChange,
  onRepost,
  post,
  handleShareModal,
  shareModalOpen,
}: ShareModalProps) => {
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const { Feed } = useFeedServerContext();
  const components = Feed.ServerShareModal.components;
  const buttons = Feed.ServerShareModal.buttons;
  const icons = Feed.ServerShareModal.icons;

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedMedia((prev) => [...prev, ...files]);
  };

  const handleRepost = () => {
    const repostData = {
      id: Date.now().toString(),
      user: currentUser,
      content,
      media: selectedMedia.map((file) => ({
        type: file.type.startsWith("video/")
          ? ("video" as const)
          : ("image" as const),
        url: URL.createObjectURL(file),
      })),
      timestamp: "agora",
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
      isOwn: true,
      isRepost: true,
      originalPost: post,
    };
    setContent("");
    setSelectedMedia([]);
    handleShareModal(true);
    if (onRepost) {
      onRepost();
    }
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        handleShareModal(open);
        if (onOpenChange) {
          onOpenChange(open);
        }
      }}
    >
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border border-border/50">
        {components.ShareModalHeader}

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              {/* <AvatarImage src={currentUser.avatar} alt={currentUser.name} /> */}
              <AvatarFallback className="bg-gradient-primary text-white">
                {currentUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">
                {currentUser.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                @{currentUser.username}
              </p>
            </div>
          </div>

          {/* Comment Input */}
          <Textarea
            placeholder="Adicione um comentário..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-24 resize-none bg-muted/30 border-border/50 focus:border-primary/50"
          />

          {/* Media Preview */}
          {selectedMedia.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {selectedMedia.map((file, index) => (
                <div key={index} className="relative aspect-square">
                  {file.type.startsWith("video/") ? (
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover rounded-lg"
                      controls
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Original Post Preview */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="w-8 h-8">
                  {/* <AvatarImage src={post.user.avatar} alt={post.user_name} /> */}
                  <AvatarFallback className="bg-gradient-primary text-white text-xs">
                    {post.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-sm">{post.user_name}</h4>
                  <p className="text-xs text-muted-foreground">
                    @{post.username}
                  </p>
                </div>
              </div>
              <p className="text-sm text-foreground line-clamp-3">
                {post.content}
              </p>
              {post.media && post.media.length > 0 && (
                <div className="mt-3">
                  <img
                    src={post.media[0].url}
                    alt="Post media"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex space-x-2">
              <label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleMediaSelect}
                />
                {buttons.MediaSelectedButtonImage}
              </label>

              <label>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={handleMediaSelect}
                />
                {buttons.MediaSelectedButtonsVideo}
              </label>
            </div>

            <Button
              onClick={handleRepost}
              className="bg-gradient-primary hover:opacity-90 text-white"
            >
              {icons.Send}
              Repostar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
