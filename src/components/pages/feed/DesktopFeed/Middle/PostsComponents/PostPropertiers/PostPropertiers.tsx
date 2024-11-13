import { CommentContentType } from "../../../../../../content_types/CommentContentType"
import { PostPropertiers } from "../../../../../../layouts/components/PostsPropertiersQuantity"

export interface PostPropertiersPostsExpandProps {
    /** Esta propriedade recebe a quantidade de comentários do post */
    quantity_comment: number
    /** Esta propriedade recebe a quantidade de likes que o post recebeu */
    quantity_likes: number
    /** Esta prop recebe true caso o usuário logado já tenha curtido este post ou false para caso não tenha */
    user_already_like: boolean
    /** Esta prop recebe o object_id do post (o id do post no banco) */
    object_id: number
}
/** Este é o componente responsável por criar as propriedades dos posts em PostExpand (ele utiliza o Composite) */
const PostPropertiersPostsExpand = ({quantity_comment, quantity_likes, user_already_like, object_id}: PostPropertiersPostsExpandProps ) => {
    return (
        <PostPropertiers.Root className="items-start">
            <PostPropertiers.Like quantity_likes={quantity_likes} user_already_like={user_already_like} object_id={object_id} content_type={CommentContentType.comment} iconClassName="h-4 w-4"/>
            <PostPropertiers.Comment quantity_comment={quantity_comment}/>
        </PostPropertiers.Root>
    )
}

export default PostPropertiersPostsExpand