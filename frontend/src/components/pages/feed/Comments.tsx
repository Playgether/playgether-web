import { PostComments } from "../../../services/getFeed"
import EditComment from "./EditComment"
import PostPropertiersPostsExpand from "./PostPropertiers"

interface CommentsProps {
    item: PostComments
}

export const Comments = ({item}: CommentsProps) => {

    return (
        <>
        <div className="w-full flex justify-between pr-4 pl-1 pt-1">
            <div className=" w-full">
                <p key={item.id}>{item.comment}</p>
            </div>
            <PostPropertiersPostsExpand quantity_comment={item.quantity_comment} quantity_likes={item.quantity_likes}/>
        </div>
        <div className="flex flex-col w-full -ml-5 mt-2 items-center justify-center gap-4">
            <EditComment Comment={item}/>
        </div>
        <div className="w-full flex pt-4 pl-1">
            <input placeholder="Responder" className="w-full"/>
        </div>
        <div className="border-b w-full border-b-gray-300 pt-2 pl-1"></div>
        </>
    )
}