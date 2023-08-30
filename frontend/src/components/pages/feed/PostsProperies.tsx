import { AiOutlineRetweet } from "react-icons/ai"
import { FaComment } from "react-icons/fa"
import { PiHeartFill } from "react-icons/pi"

type PostProperies = {
    quantity_likes: number;
    quantity_comment: number;
    quantity_reposts: number; 
}
const PostProperies = ({resource} : {resource : PostProperies }) => {
    return (
        <>
        <div className="border-b border-opacity-30"></div>
        <div className="bg-white-200 pl-3 pr-3 text-orange-500 flex flex-col justify-center items-center h-12">
            <div className="w-5/6 flex flex-row justify-between">
                <div className="flex flex-row items-center justify-center space-x-2">
                    <PiHeartFill className="h-6 w-6" />
                    <p className="text-black-200">{resource?.quantity_likes}</p>
                </div>
                <div className="flex flex-row items-center justify-center space-x-2">
                    <FaComment className="h-6 w-6" />
                    <p className="text-black-200">{resource?.quantity_comment}</p>
                </div>
                <div className="flex flex-row items-center justify-center space-x-2">
                    <AiOutlineRetweet className="h-6 w-6" />
                    <p className="text-black-200">{resource?.quantity_reposts}</p>
                </div>
            </div>
        </div>
        </>
    )
}

export default PostProperies;