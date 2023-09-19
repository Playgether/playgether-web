import { CommentContentType } from "../../content_types/CommentContentType"
import FormComment from "../../layouts/Forms/FormComment"

interface CommentProps {
    id: number
}

const CommentInput = ({id}: CommentProps) => {
    return (
        <div className="container w-full h-20 sticky bottom-0">
            <FormComment content_type={CommentContentType.post} object_id={id}/>
        </div>
    )
}

export default CommentInput