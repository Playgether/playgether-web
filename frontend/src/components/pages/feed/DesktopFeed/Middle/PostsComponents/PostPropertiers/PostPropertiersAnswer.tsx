import { CommentContentType } from "../../../../../../content_types/CommentContentType"
import { PostPropertiers } from "../../../../../../layouts/components/PostsPropertiersQuantity"

export interface PostPropertiersPostsAnswerProps {
    /** Esta propriedade recebe a quantidade de likes que o post recebeu */
    quantity_likes: number
    /** Esta prop recebe true caso o usuário logado já tenha curtido este post ou false para caso não tenha */
    user_already_like: boolean
    /** Esta prop recebe o object_id do post (o id do post no banco) */
    object_id: number
}
/** Este é o componente responsável por criar as propriedades das respostas dos comentários dos posts em PostExpand (ele utiliza o Composite) */
const PostPropertiersPostsAnswer = ({quantity_likes, user_already_like, object_id}: PostPropertiersPostsAnswerProps ) => {
    return (
        <PostPropertiers.Root className="items-start">
            <PostPropertiers.Like quantity_likes={quantity_likes} user_already_like={user_already_like} object_id={object_id} content_type={CommentContentType.comment} iconClassName="h-4 w-4"/>
        </PostPropertiers.Root>
    )
}

export default PostPropertiersPostsAnswer