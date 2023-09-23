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
    const [onClicked, setOnClicked] = useState(initialOnClicked)
    const [quantitylikesNumber, setQuantityLikesNumber] = useState(quantity_likes)
    const [effect, setEffect] = useState(false);

    const handleClick = () => {
        const newOnClicked = !onClicked;
        setOnClicked(newOnClicked);
        localStorage.setItem('onClicked', newOnClicked.toString());
      };

    return (
        <div className="flex flex-row justify-center items-center space-x-2">
            {onClicked === true ? 
            <PiHeartFill className={twJoin("animate-like cursor-pointer", iconClassName)} 
            onClick={() => {
                handleClick()
                setQuantityLikesNumber(quantitylikesNumber - 1)
                onClick
                setOnClicked(!onClicked)
                setEffect(true);
            }}
            /> : 
            <PiHeartThin className={twJoin('cursor-pointer animate-deleteLike', iconClassName)} 
            onClick={() => {
                setQuantityLikesNumber(quantitylikesNumber + 1)
                onClick
                setOnClicked(!onClick)
            }}
            />}
            <p className="text-black-200">{quantitylikesNumber}</p>
        </div>
    )
}

export default PropertiersLike