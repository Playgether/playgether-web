import { PostPropertiers } from "../../layouts/components/PostsPropertiersQuantity";
import { LikeContentType } from '../../content_types/LikeContentType';

type PostProperies = {
    quantity_likes: number;
    quantity_comment: number;
    quantity_reposts: number; 
    user_already_like: boolean
    object_id: number
}
const PostProperies = ({quantity_likes, quantity_comment, quantity_reposts, user_already_like, object_id}: PostProperies ) => {

    return (
        <>
        <div className="border-b border-opacity-30"></div>
        <div className="bg-white-200 pl-3 pr-3 text-orange-500 flex flex-col justify-center items-center h-12">
            <div className="w-5/6 flex flex-row justify-between">
                <PostPropertiers.Root className="w-full flex flex-row justify-between">
                    <PostPropertiers.Like quantity_likes={quantity_likes} user_already_like={user_already_like} content_type={LikeContentType.post} object_id={object_id} iconClassName="h-6 w-6" />
                    <PostPropertiers.Comment quantity_comment={quantity_comment} iconClassName="h-6 w-6"/>
                    <PostPropertiers.Share quantity_reposts={quantity_reposts} iconClassName="h-6 w-6"/>
                </PostPropertiers.Root>
            </div>
        </div>
        </>
    )
}

export default PostProperies;
