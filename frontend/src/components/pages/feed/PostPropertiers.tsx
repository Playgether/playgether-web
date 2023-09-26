import { PostPropertiers } from "../../layouts/components/PostsPropertiersQuantity"

interface PostPropertiersPostsExpandProps {
    quantity_comment: number
    quantity_likes: number
    user_already_like: boolean
}
const PostPropertiersPostsExpand = ({quantity_comment, quantity_likes, user_already_like}: PostPropertiersPostsExpandProps ) => {
    return (
        <PostPropertiers.Root className="items-start">
            <PostPropertiers.Like quantity_likes={quantity_likes} user_already_like={user_already_like} iconClassName="h-4 w-4"/>
            <PostPropertiers.Comment quantity_comment={quantity_comment}/>
        </PostPropertiers.Root>
    )
}

export default PostPropertiersPostsExpand