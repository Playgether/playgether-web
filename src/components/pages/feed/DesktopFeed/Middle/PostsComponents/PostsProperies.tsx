import { LikeContentType } from "../../../../../content_types/LikeContentType";
import { PostPropertiers } from "../../../../../layouts/components/PostsPropertiersQuantity";

type PostProperies = {
  quantity_likes: number;
  quantity_comment: number;
  quantity_reposts: number;
  user_already_like: boolean;
  object_id: number;
};
const PostProperies = ({
  quantity_likes,
  quantity_comment,
  quantity_reposts,
  user_already_like,
  object_id,
}: PostProperies) => {
  return (
    <>
      <div className="PostPropertiers-wrapper pl-3 pr-3 flex flex-col justify-center items-center h-12">
        <div className="w-5/6 flex flex-row justify-between">
          <PostPropertiers.Root className="w-full flex flex-row justify-between">
            <PostPropertiers.Like
              quantitylikesNumber={quantity_likes}
              clicked={user_already_like}
              content_type={LikeContentType.post}
              object_id={object_id}
              iconClassName="h-4 w-4 lg:h-6 lg:w-6"
            />
            <PostPropertiers.Comment
              quantity_comment={quantity_comment}
              iconClassName="h-4 w-4 lg:h-6 lg:w-6"
            />
            <PostPropertiers.Share
              quantity_reposts={quantity_reposts}
              iconClassName="h-4 w-4 lg:h-6 lg:w-6"
              onClickShare={() => {}}
            />
          </PostPropertiers.Root>
        </div>
      </div>
    </>
  );
};

export default PostProperies;
