import { PiHeartFill } from "react-icons/pi"
import { twJoin } from "tailwind-merge"

interface PropertiersLikeProps {
    quantity_likes: number
    iconClassName?: string
}
const PropertiersLike = ({quantity_likes, iconClassName}: PropertiersLikeProps) => {
    return (
        <div className="flex flex-row justify-center items-center space-x-2">
            <PiHeartFill className={twJoin(iconClassName)} />
            <p className="text-black-200">{quantity_likes}</p>
        </div>
    )
}

export default PropertiersLike