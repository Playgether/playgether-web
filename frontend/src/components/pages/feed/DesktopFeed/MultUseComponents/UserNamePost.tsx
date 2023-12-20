import { HTMLAttributes } from "react";
import { twJoin } from "tailwind-merge";

interface UserNameProps extends HTMLAttributes<HTMLDivElement> {
    username: string
}

const UserNamePost = ({username, ...rest}:UserNameProps) => {
    return (
        
        <div className={twJoin("", rest.className)} {...rest}>
            <h1 className="text-orange-500 text-sm lg:text-md">{username}</h1>
        </div> 
    )
}

export default UserNamePost;