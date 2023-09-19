import { HTMLAttributes, ReactNode } from "react"
import { twJoin } from "tailwind-merge"

interface PostPropertiersQuantityRoot extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
}

const PostPropertiersQuantityRoot = ({children, ...rest} : PostPropertiersQuantityRoot) => {
    return (
        <div className={twJoin("flex flex-row gap-2 text-orange-400", rest.className)}>
            <div className="flex justify-between space-x-2">
                {children}
            </div>
        </div>
    )
}

export default PostPropertiersQuantityRoot