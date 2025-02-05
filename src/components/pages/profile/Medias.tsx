import { useState } from "react";
import { PostsStats } from "./PostStats";
import Posts from "../feed/DesktopFeed/Middle/PostsComponents/Posts/Posts";

export const Medias = () => {
  const [hovered, setHovered] = useState(false);
  const medias = [
    {
      id: 20,
      media_file: "htwuptge8fytogzjaywc",
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
      media_file: "htwuptge8fytogzjaywc",
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
          postWidth={480}
          className="h-full w-full p-4"
          objectFit="cover"
        />
      </div>
      <div className="aspect-[16/8] min-h-[200px] min-w-[400px] w-[48%] rounded-md cursor-pointer">
        <Posts
          media={medias2}
          onClick={() => false}
          slideIndex={0}
          postWidth={480}
          className="h-full w-full p-4"
          objectFit="cover"
          plays={false}
        />
      </div>
    </div>
  );
};
