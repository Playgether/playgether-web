"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostModal } from "@/app/feed/components/PostModal";
import { useFeedContext } from "@/app/feed/context/FeedContext";
import type { PostProps } from "@/app/feed/types/PostProps";

interface PostPageClientProps {
  postId: number;
  post: PostProps;
}

function PostPageClientInner({ postId, post }: PostPageClientProps) {
  const router = useRouter();
  const { injectPost, getPostById } = useFeedContext();

  // Inject post into FeedContext so PostModal can find it via getPostById
  useEffect(() => {
    if (!getPostById(postId)) {
      injectPost(post);
    }
  }, [postId, post, injectPost, getPostById]);

  const postInContext = getPostById(postId);
  if (!postInContext) return null;

  return <PostModal postId={postId} onClose={() => router.push("/feed")} fullPage />;
}

export function PostPageClient(props: PostPageClientProps) {
  return (
    <Suspense fallback={null}>
      <PostPageClientInner {...props} />
    </Suspense>
  );
}
