import { useState } from "react";
import { PostsStats } from "./PostStats";
import Posts from "../feed/DesktopFeed/Middle/PostsComponents/Posts/Posts";

export const Medias = () => {
  const [hovered, setHovered] = useState(false);
  const medias = [
    {
      id: 20,
      media_file: "hdcboa7x5yvi7ve1pnfy",
      media_type: "video",
    },
    {
      id: 20,
      media_file: "bqlwcps5sxbumxcf7xnp",
      media_type: "image",
    },
    {
      id: 20,
      media_file: "fempriecegmfdjtae5fe",
      media_type: "image",
    },
  ];
  const medias2 = [
    {
      id: 20,
      media_file: "hdcboa7x5yvi7ve1pnfy",
      media_type: "video",
    },
    {
      id: 20,
      media_file: "bqlwcps5sxbumxcf7xnp",
      media_type: "image",
    },
    {
      id: 20,
      media_file: "fempriecegmfdjtae5fe",
      media_type: "image",
    },
  ];

  return (
    <div className="animate-menuProfileFadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/30 shadow-card hover:shadow-glow transition-all duration-200">
          <div className="aspect-[16/8] min-h-[200px] w-full cursor-pointer">
            <Posts
              media={medias}
              onClick={() => false}
              slideIndex={0}
              postWidth={1920}
              className="w-full h-full"
              objectFit="cover"
            />
          </div>
          <div className="px-4 py-3 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <span className="text-red-500">♥</span> 45
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="text-neon-blue">💬</span> 12
              </span>
            </div>
            <span>há 2 horas</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/30 shadow-card hover:shadow-glow transition-all duration-200">
          <div className="aspect-[16/8] min-h-[200px] w-full cursor-pointer">
            <Posts
              media={medias2}
              onClick={() => false}
              slideIndex={0}
              postWidth={1920}
              className="w-full h-full"
              objectFit="cover"
              plays={false}
              postHeight={720}
            />
          </div>
          <div className="px-4 py-3 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <span className="text-red-500">♥</span> 89
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="text-neon-blue">💬</span> 23
              </span>
            </div>
            <span>há 1 dia</span>
          </div>
        </div>
      </div>
    </div>
  );
};
