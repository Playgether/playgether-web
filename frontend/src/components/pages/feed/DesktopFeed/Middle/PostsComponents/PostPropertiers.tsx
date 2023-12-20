import { CommentContentType } from "../../../../../content_types/CommentContentType"
import { PostPropertiers } from "../../../../../layouts/components/PostsPropertiersQuantity"


interface PostPropertiersPostsExpandProps {
    quantity_comment: number
    quantity_likes: number
    user_already_like: boolean
    object_id: number
}
const PostPropertiersPostsExpand = ({quantity_comment, quantity_likes, user_already_like, object_id}: PostPropertiersPostsExpandProps ) => {
    return (
        <PostPropertiers.Root className="items-start">
            <PostPropertiers.Like quantity_likes={quantity_likes} user_already_like={user_already_like} object_id={object_id} content_type={CommentContentType.comment} iconClassName="h-4 w-4"/>
            <PostPropertiers.Comment quantity_comment={quantity_comment}/>
        </PostPropertiers.Root>
    )
}

export default PostPropertiersPostsExpand