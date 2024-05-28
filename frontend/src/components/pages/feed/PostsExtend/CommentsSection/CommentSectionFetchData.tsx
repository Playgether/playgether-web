import { useCommentsContext } from "../../../../../context/CommentsContext"
import { CommentsSection } from "./CommentsSectionLogic"

async function fetchData (postId) {
   const {fetchComments} = useCommentsContext()
   await fetchComments(postId)
}

const CommentSectionLogic = async ({postId}:{postId: number}) => {
    await fetchData(postId)

    return <> <CommentsSection /> </>
    
}

export default CommentSectionLogic