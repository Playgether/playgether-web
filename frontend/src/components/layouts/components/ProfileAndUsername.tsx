import { HTMLAttributes } from "react"
import ProfileImagePost from "../../pages/feed/ProfileImagePost"
import UserNamePost from "../../pages/feed/UserNamePost"
import { twJoin } from "tailwind-merge"

interface ProfileAndUsernameProps extends HTMLAttributes<HTMLDivElement>{
    username: string
    profile_photo: string
    imageClassName?: string
}

const ProfileAndUsername = ({username, profile_photo, imageClassName, ...rest}: ProfileAndUsernameProps) => {
    return (
        <div className={twJoin("", rest.className)} {...rest}>
            <div className="flex items-center gap-2">
                <ProfileImagePost link_photo={profile_photo} className={imageClassName}/>
                <UserNamePost username={username}/>
            </div>
        </div>
    )
}

export default ProfileAndUsername