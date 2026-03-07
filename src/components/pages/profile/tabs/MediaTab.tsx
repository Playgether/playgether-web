"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle } from "lucide-react";
import { mockMedia } from "../constants";

export function MediaTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockMedia.map((item) => (
        <Card
          key={item.id}
          className="overflow-hidden group cursor-pointer hover:shadow-card transition-all duration-200"
        >
          <div className="relative">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
            {item.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-4 border-l-black border-y-2 border-y-transparent ml-1" />
                </div>
              </div>
            )}
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-xs text-white">
              {item.time}
            </div>
          </div>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 truncate">{item.title}</h4>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span>{item.likes}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span>{item.comments}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
