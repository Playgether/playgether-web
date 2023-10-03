import { HTMLAttributes } from "react"
import ProfileImagePost from "../../pages/feed/ProfileImagePost"
import UserNamePost from "../../pages/feed/UserNamePost"
import { twJoin } from "tailwind-merge"
import TimeAgo from "react-timeago";
import brazilianStrings from 'react-timeago/lib/language-strings/pt-br'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'


interface ProfileAndUsernameProps extends HTMLAttributes<HTMLDivElement>{
    username: string
    profile_photo: string
    imageClassName?: string
    timestamp?:number | Date
    usernameAndTimestampDiv?:string
}

const ProfileAndUsername = ({username, profile_photo, imageClassName, timestamp, usernameAndTimestampDiv, ...rest}: ProfileAndUsernameProps) => {
    const formatter = buildFormatter(brazilianStrings)
    return (
        <div className={twJoin("", rest.className)} {...rest}>
            <div className="flex items-center gap-2">
                <ProfileImagePost link_photo={profile_photo} className={imageClassName}/>
                <div className={twJoin('text-lg', usernameAndTimestampDiv)}>
                <UserNamePost username={username}/>
                {timestamp ?
                    <div className="text-gray-400 text-sm">
                        <TimeAgo date={timestamp} formatter={formatter} />
                    </div>
                    : null
                }
                </div>
            </div>
        </div>
    )
}

export default ProfileAndUsername