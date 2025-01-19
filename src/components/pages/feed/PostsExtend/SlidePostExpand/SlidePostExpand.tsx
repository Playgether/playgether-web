import { Suspense } from "react";
import { PostMedias } from "../../../../../services/getFeed";
import Posts from "../../DesktopFeed/Middle/PostsComponents/Posts/Posts";
import { VideoLoadingFallback } from "../../DesktopFeed/Middle/PostsComponents/Posts/VideoLoadingFallBack";

export interface SlidePostExpandProps {
  /** Esta prop recebe uma lista de medias do tipo "PostMedias" localizada no service "getFeed" para serem adicionadas ao slide */
  medias: PostMedias[];
  /** Esta prop recebe o número do index que você quer que o slide começe (position na ordem das medias onde o slide vai inciar) */
  slideIndex: number;
}

/** Este componente é responsável por criar o slide das medias em PostsExtendHasPostMedia*/
export const SlidePostExpand = ({
  medias,
  slideIndex,
}: SlidePostExpandProps) => {
  return (
    <div className="2xl:w-4/6 w-3/6 h-full max-w-[1080px] SlidePostExpand-wrapper">
      <Suspense fallback={<VideoLoadingFallback />}>
        <div className="w-[1080px] h-full">
          <Posts
            media={medias}
            onClick={() => false}
            slideIndex={slideIndex}
            postHeight={600}
            postWidth={1280}
            className="max-w-[1080px] w-full"
          />
        </div>
      </Suspense>
    </div>
  );
};
