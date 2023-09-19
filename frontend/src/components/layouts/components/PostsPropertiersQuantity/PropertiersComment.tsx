import { FaComment } from "react-icons/fa"
import { twJoin } from "tailwind-merge"

interface PropertiersCommentProps {
    quantity_comment: number,
    iconClassName?: string
}

const PropertiersComment = ({quantity_comment, iconClassName}: PropertiersCommentProps) => {
    return (
        <div className="flex flex-row items-center justify-center space-x-2">
            <FaComment className={twJoin(iconClassName)} />
            <p className="text-black-200">{quantity_comment}</p>
        </div>
    )
}

export default PropertiersComment