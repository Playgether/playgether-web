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
    <div className="flex flex-wrap gap-2 mt-6">
      <div className="aspect-[16/8] min-h-[200px] min-w-[400px] w-[48%] rounded-md cursor-pointer">
        <Posts
          media={medias}
          onClick={() => false}
          slideIndex={0}
          postWidth={1920}
          className="w-full h-full"
          objectFit="cover"
        />
      </div>
      <div className="aspect-[16/8] min-h-[200px] min-w-[400px] w-[48%] rounded-md cursor-pointer">
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
    </div>
  );
};
