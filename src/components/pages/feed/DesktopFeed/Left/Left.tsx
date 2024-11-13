import { ProfileContextProvider } from "../../../../../context/ProfileContext"
import OnlineFriendsCard from "./OnlineFriends/OnlineFriendsCard"
import ProfileCard from "./Profile/ProfileCard"


/** Este componente é o wrapper principal da parte "Left" no componente de feed */
const Left = () => {
    return (

        <div className="flex flex-row space-x-2 w-full 2xl:sticky top-0 h-full">
            <div className="bg-opacity-80 flex-1 flex flex-col space-y-4 items-end gap-2 2xl:sticky top-0 2xl:h-fit sticky-last">
                <ProfileCard />
                <OnlineFriendsCard />
            </div>
        </div>

    )
}

export default Left