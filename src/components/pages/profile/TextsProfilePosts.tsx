import { useEffect, useState } from "react";
import TextLimitComponent from "../../layouts/SuspenseFallBack/TextLimitComponent/TextLimitComponent";
import { PostsStats } from "./PostStats";

let text =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

const objPosts = [
  {
    ob1: {
      text: text,
    },
  },
  {
    ob2: {
      text: text,
    },
  },
  {
    ob3: {
      text: text,
    },
  },
  {
    ob4: {
      text: text,
    },
  },
  {
    ob5: {
      text: text,
    },
  },
  {
    ob6: {
      text: text,
    },
  },
  {
    ob7: {
      text: text,
    },
  },
  {
    ob8: {
      text: text,
    },
  },
  {
    ob9: {
      text: text,
    },
  },
  {
    ob10: {
      text: text,
    },
  },
  {
    ob11: {
      text: text,
    },
  },
  {
    ob12: {
      text: text,
    },
  },
  {
    ob13: {
      text: text,
    },
  },
  {
    ob14: {
      text: text,
    },
  },
];

export const TextsProfilePosts = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [effect, setEffect] = useState("animate-hoverUp");

  const handleMouseOver = (index) => {
    setEffect(
      "motion-translate-x-in-[0%] motion-translate-y-in-[100%] motion-duration-[0.30s]"
    );
    setHoveredIndex(index);
  };

  const handleMouseOut = (index) => {
    setHoveredIndex(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4 animate-menuProfileFadeIn relative">
      {objPosts.map((obj, index) => (
        <div
          key={index}
          className={`cursor-pointer rounded-xl border border-border/50 bg-card/30 shadow-card hover:shadow-glow transition-all duration-200 relative ${
            hoveredIndex === index ? "hovered" : ""
          }`}
          onMouseOver={() => handleMouseOver(index)}
          onMouseLeave={() => handleMouseOut(index)}
        >
          <TextLimitComponent
            text={text}
            maxCharacters={200}
            className="p-4 z-40 font-light text-sm text-card-foreground"
            textFinal={" ...expandir"}
          />
          {hoveredIndex === index && (
            <div className="absolute z-50 bottom-0 w-full">
              <PostsStats className={effect} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
