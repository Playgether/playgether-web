import { ProfileContextProvider } from "../../../../../context/ProfileContext"
import OnlineFriendsCard from "./OnlineFriends/OnlineFriendsCard"
import ProfileCard from "./Profile/ProfileCard"

const Left = () => {
    return (
        <div>
            <div className="flex flex-row h-full space-x-2">
                <div className="bg-white-200 bg-opacity-80 flex-1 h-5/6 flex flex-col space-y-4">
                    <ProfileContextProvider>
                        <ProfileCard />
                    </ProfileContextProvider>
                    <OnlineFriendsCard />
                </div>
            </div>
        </div>
    )
}

export default Left