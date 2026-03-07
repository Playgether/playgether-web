"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Heart, MessageCircle } from "lucide-react";
import { mockPosts } from "../constants";

export function PostsTab() {
  return (
    <div className="space-y-4">
      {mockPosts.map((post) => (
        <Card
          key={post.id}
          className="hover:shadow-card transition-shadow duration-200"
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold">{post.title}</h4>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.date}
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {post.content}
              </p>
              <div className="flex items-center gap-4 pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                >
                  <Heart className="h-4 w-4" />
                  {post.likes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                >
                  <MessageCircle className="h-4 w-4" />
                  {post.comments}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
