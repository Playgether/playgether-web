import TextLimitComponent from "./TextLimitComponent"

type PostTextProps = {
    resource: {
        comment:string
    }
    maxCharacteres:number
}

const PostText = ({resource, maxCharacteres}:PostTextProps) => {
    return (
    <div className="w-full text-left pl-4 lg:pl-6 pr-6 text-black-300 text-sm">
        <TextLimitComponent text={`${resource?.comment}`} maxCharacters={maxCharacteres} />
    </div>
    )
}

export default PostText