'use client'

import { PiHeartFill, PiHeartThin } from "react-icons/pi"
import { twJoin } from "tailwind-merge"
import { useState } from "react"
import { useAuthContext } from "../../../../context/AuthContext"
import { postLike } from "../../../../services/postLike"
import { deleteLike } from "../../../../services/deleteLike"

interface PropertiersLikeProps {
    quantity_likes: number
    iconClassName?: string
    user_already_like: boolean
    content_type: string
    object_id: number
}
const PropertiersLike = ({quantity_likes, iconClassName, user_already_like, content_type, object_id}: PropertiersLikeProps) => {
    const [onClicked, setOnClicked] = useState(user_already_like)
    const [quantitylikesNumber, setQuantityLikesNumber] = useState(quantity_likes)
    const [effectThin, setEffectThin] = useState(false);
    const [effectFill, setEffectFill] = useState(false)
    const { user, authTokens } = useAuthContext();

    const onClickLike = () => {
        const data = {
            user: user?.user_id,
            content_type: content_type,
            object_id: object_id
        }
        setOnClicked(true);
        postLike(data, authTokens)
    }

    const onClickDeleteLike = () => {
        setOnClicked(false)
        deleteLike(authTokens, object_id)
    }

    return (
        <div className="flex flex-row justify-center items-center space-x-2">
            {onClicked === true ? 
            <PiHeartFill className={twJoin("cursor-pointer", iconClassName, effectFill === true ? "animate-like" : '')} 
            onClick={() => {
                setQuantityLikesNumber(quantitylikesNumber - 1)
                setOnClicked(!onClicked)
                setEffectThin(true);
                onClickDeleteLike()
            }}
            /> : 
            <PiHeartThin className={twJoin('cursor-pointer ', iconClassName, effectThin === true ? "animate-deleteLike" : '')} 
            onClick={() => {
                setQuantityLikesNumber(quantitylikesNumber + 1)
                setEffectFill(true)
                onClickLike()
            }}
            />}
            <p className="text-black-200">{quantitylikesNumber}</p>
        </div>
    )
}

export default PropertiersLike