'use client'

import { PiHeartFill, PiHeartThin } from "react-icons/pi"
import { twJoin } from "tailwind-merge"
import { useState } from "react"

interface PropertiersLikeProps {
    quantity_likes: number
    iconClassName?: string
    onClick: () => void
}
const PropertiersLike = ({quantity_likes, iconClassName, onClick}: PropertiersLikeProps) => {
    const initialOnClicked = localStorage.getItem('onClicked') === 'true';
    const [onClicked, setOnClicked] = useState(false)
    const [quantitylikesNumber, setQuantityLikesNumber] = useState(quantity_likes)
    const [effectThin, setEffectThin] = useState(false);
    const [effectFill, setEffectFill] = useState(false)

    const handleClick = () => {
        const newOnClicked = !onClicked;
        setOnClicked(newOnClicked);
        localStorage.setItem('onClicked', newOnClicked.toString());
      };

    return (
        <div className="flex flex-row justify-center items-center space-x-2">
            {onClicked === true ? 
            <PiHeartFill className={twJoin("cursor-pointer", iconClassName, effectFill === true ? "animate-like" : '')} 
            onClick={() => {
                handleClick()
                setQuantityLikesNumber(quantitylikesNumber - 1)
                onClick
                setOnClicked(!onClicked)
                setEffectThin(true);
            }}
            /> : 
            <PiHeartThin className={twJoin('cursor-pointer ', iconClassName, effectThin === true ? "animate-deleteLike" : '')} 
            onClick={() => {
                setQuantityLikesNumber(quantitylikesNumber + 1)
                onClick
                setOnClicked(!onClick)
                setEffectFill(true)
            }}
            />}
            <p className="text-black-200">{quantitylikesNumber}</p>
        </div>
    )
}

export default PropertiersLike