"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Video, X, Send } from "lucide-react";
import { Card } from "@/components/ui/card";

// Import current user avatar
import avatarRaymond from "@/assets/avatar-raymond.jpg";
import { useFeedContext } from "../context/FeedContext";

const currentUser = {
  name: "Raymond Junior",
  username: "raymond",
  avatar: avatarRaymond,
};

export const CreatePostModal = () => {
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const { handlePostCreated, handleCreatePostModal, createPostOpen } =
    useFeedContext();

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedMedia((prev) => [...prev, ...files]);
  };

  const removeMedia = (index: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim() && selectedMedia.length === 0) return;

    const newPost = {
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
    };

    handlePostCreated(newPost);
    setContent("");
    setSelectedMedia([]);
    handleCreatePostModal(false);
  };

  return (
    <Dialog open={createPostOpen} onOpenChange={handleCreatePostModal}>
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Criar Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
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

          {/* Content Input */}
          <Textarea
            placeholder="O que está acontecendo?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-32 resize-none bg-muted/30 border-border/50 focus:border-primary/50"
          />

          {/* Media Preview */}
          {selectedMedia.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {selectedMedia.map((file, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <div className="relative aspect-square">
                    {file.type.startsWith("video/") ? (
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 w-8 h-8"
                      onClick={() => removeMedia(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

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
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary"
                  asChild
                >
                  <span>
                    <Image className="w-5 h-5" />
                  </span>
                </Button>
              </label>

              <label>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={handleMediaSelect}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary"
                  asChild
                >
                  <span>
                    <Video className="w-5 h-5" />
                  </span>
                </Button>
              </label>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!content.trim() && selectedMedia.length === 0}
              className="bg-gradient-primary hover:opacity-90 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Postar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
