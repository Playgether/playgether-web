'use client'

import { AiOutlineRetweet } from "react-icons/ai"
import { twJoin } from "tailwind-merge"
import { useState } from "react"

interface PropertiersShareProps {
    quantity_reposts: number
    iconClassName?: string
}

const PropertiersShare = ({quantity_reposts, iconClassName}: PropertiersShareProps) => {
    return (
        <div className="flex flex-row justify-center items-center space-x-2">
            <AiOutlineRetweet className={twJoin(iconClassName)} />
            <p className="text-black-200">{quantity_reposts}</p>
        </div>
    )
}

export default PropertiersShare