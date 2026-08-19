import { MentionText } from "@/components/mentions/MentionText";

export default function PostText({ post, handlePostClick }) {
  return (
    <div className="pointer-events-auto mb-4">
      <p
        className="text-foreground leading-relaxed cursor-pointer line-clamp-5 whitespace-pre-wrap"
        onClick={handlePostClick}
      >
        <MentionText
          text={post.comment}
          plainTextClassName="transition-colors hover:text-primary/80"
        />
      </p>
    </div>
  );
}
