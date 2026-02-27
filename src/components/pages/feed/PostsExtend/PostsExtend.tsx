"use client";
import { ClosePostExpand } from "./ClosePostExpand";
import PostsExtendHasPostMedia from "./PostsHasPostMedia/PostsExtendHasPostMedia";
import PostsExtendHasNoPostMedia from "./PostsHasNoPostMedia/PostsExtendHasNoPostMedia";
import { CommentsContextProvider } from "../../../../context/CommentsContext";
import { useEffect } from "react";
import { useMiddleFeedContext } from "@/context/MiddleFeedContext";

/** Este é o componente responsável por gerar a página extendida de um post que foi clicado no feed(Expande o post mostrando os comentários etc).  */
const PostsExtend = ({
  children,
  resourceObject,
}: {
  children: React.ReactNode;
  resourceObject?: any;
}) => {
  const { handlePostsCloseExtend, slideIndex } = useMiddleFeedContext();
  useEffect(() => {
    const disableScrollAndEvents = (e: Event) => e.stopPropagation(); // Impede propagação para o fundo
    const preventScroll = () => (document.body.style.overflow = "hidden");

    preventScroll();
    const backdrop = document.querySelector(".backdrop");
    backdrop?.addEventListener("scroll", disableScrollAndEvents, {
      passive: false,
    });
    backdrop?.addEventListener("click", disableScrollAndEvents);

    return () => {
      document.body.style.overflow = "auto";
      backdrop?.removeEventListener("scroll", disableScrollAndEvents);
      backdrop?.removeEventListener("click", disableScrollAndEvents);
    };
  }, []);

  return (
    <div className="h-screen">
      <div
        className="fixed inset-0 z-40 bg-opacity-50"
        onClick={handlePostsCloseExtend}
      />
      {/* {children} */}
      <div
        className="fixed z-50 flex left-0 right-0 justify-center bottom-[65px] mx-auto w-full bg-white shadow-lg bg-black-300 bg-opacity-50"
        style={{ height: "calc(100vh - 65px)" }}
      >
        <div className="flex w-11/12 bg-white shadow-lg mt-[60px] mb-[20px] gap-[2px] max-w-[1920px] max-h-[1080px]">
          {resourceObject?.has_post_media ? (
            <CommentsContextProvider
              response={{ data: [], next_page: null, previous_page: null }}
              postId={0}
            >
              <PostsExtendHasPostMedia />
            </CommentsContextProvider>
          ) : (
            <CommentsContextProvider
              response={{ data: [], next_page: null, previous_page: null }}
              postId={0}
            >
              <PostsExtendHasNoPostMedia />
            </CommentsContextProvider>
          )}
          <ClosePostExpand />
        </div>
      </div>
    </div>
  );
};

export default PostsExtend;
