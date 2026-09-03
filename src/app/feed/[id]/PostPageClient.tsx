"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PostModal } from "@/app/feed/components/PostModal";
import { useFeedContext } from "@/app/feed/context/FeedContext";
import Login from "@/components/pages/index/Login";
import Cadastro from "@/components/pages/index/Cadastro";
import type { PostProps } from "@/app/feed/types/PostProps";

interface PostPageClientProps {
  postId: string;
  post: PostProps;
  isGuest?: boolean;
}

type AuthOverlay = "login" | "cadastro" | null;

function PostPageClientInner({
  postId,
  post,
  isGuest = false,
}: PostPageClientProps) {
  const router = useRouter();
  const { injectPost, getPostById } = useFeedContext();
  const [authOverlay, setAuthOverlay] = useState<AuthOverlay>(null);

  // Inject post into FeedContext so PostModal can find it via getPostById
  useEffect(() => {
    if (!getPostById(postId)) {
      injectPost(post);
    }
  }, [postId, post, injectPost, getPostById]);

  const postInContext = getPostById(postId);
  if (!postInContext) return null;

  const redirectTo =
    typeof window !== "undefined" ? window.location.pathname : `/feed/${postId}`;

  return (
    <>
      <PostModal
        postId={postId}
        onClose={() => router.push(isGuest ? "/" : "/feed")}
        fullPage
        isGuest={isGuest}
        onRequireAuth={() => setAuthOverlay("login")}
      />
      {authOverlay === "login" ? (
        <Login
          onClickX={() => setAuthOverlay(null)}
          onClickAqui={() => setAuthOverlay("cadastro")}
          redirectTo={redirectTo}
        />
      ) : null}
      {authOverlay === "cadastro" ? (
        <Cadastro
          onClickX={() => setAuthOverlay(null)}
          onClickAqui={() => setAuthOverlay("login")}
        />
      ) : null}
    </>
  );
}

export function PostPageClient(props: PostPageClientProps) {
  return (
    <Suspense fallback={null}>
      <PostPageClientInner {...props} />
    </Suspense>
  );
}
