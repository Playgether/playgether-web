import { PostPropertiers } from "../../layouts/components/PostsPropertiersQuantity"

interface PostPropertiersPostsExpandProps {
    quantity_comment: number
    quantity_likes: number
}
const PostPropertiersPostsExpand = ({quantity_comment, quantity_likes}: PostPropertiersPostsExpandProps ) => {
    return (
        <PostPropertiers.Root className="items-start">
            <PostPropertiers.Like quantity_likes={quantity_likes} iconClassName="h-4 w-4"/>
            <PostPropertiers.Comment quantity_comment={quantity_comment}/>
        </PostPropertiers.Root>
    )
}

export default PostPropertiersPostsExpand