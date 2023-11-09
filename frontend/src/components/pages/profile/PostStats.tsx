import { AiOutlineRetweet } from "react-icons/ai"
import { FaComment } from "react-icons/fa"
import { PiHeartFill } from "react-icons/pi"

export const PostsStats = () => {
    return (
        <div className="bg-blue-300 rounded-b-lg flex justify-between items-center px-8 h-10">
            <div className="flex text-black-300 gap-2 text-md justify-center items-center font-semibold">
                <PiHeartFill className="text-orange-500 h-6 w-6"/>
                <p>250</p>
            </div>

            <div className="flex text-black-300 gap-2 text-md justify-center items-center font-semibold">
                <FaComment className="text-orange-500 h-5 w-5"/>
                <p>178</p>
            </div>

            <div className="flex text-black-300 gap-2 text-md justify-center items-center font-semibold">
                <AiOutlineRetweet className="text-orange-500 h-6 w-6"/>
                <p>102</p>
            </div>
        </div>
    )
}