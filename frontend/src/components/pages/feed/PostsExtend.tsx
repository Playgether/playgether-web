import ButtonClose from "../../elements/ButtonClose"
import Posts from "./Posts"

export interface PostsExtendProps {
    onClose: () => void
    resource: {
        created_by_user_photo:string
        medias: {}
        comments: {}
    }
} 

const PostsExtend = ({onClose, resource}:PostsExtendProps) => {

    return (
        <div className="absolute flex flex-row left-0 right-0 z-50 w-full h-[80vh] pl-10 pr-10">
            <div className="w-4/6 text-black-300 bg-red-200 h-full">
                <Posts media={resource.medias}/>
            </div>
            <div className="flex-1 text-black-300 bg-green-200">
                {resource.comments.map((comment) => {
                    <p>{comment}</p>
                })}
            </div>
            <div className="h-10 w-10">
            <ButtonClose className="h-full w-full" onClick={onClose}>X</ButtonClose>
            </div>
        </div> 
    )
}

export default PostsExtend