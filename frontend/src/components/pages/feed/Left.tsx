import OnlineFriendsCard from "./OnlineFriendsCard"
import ProfileCard from "./ProfileCard"

const Left = () => {
    return (
        <div>
            <div className="flex flex-row h-full pt-2 space-x-2">
                <div className="bg-white-300 flex-1 h-5/6 flex flex-col space-y-4">
                    <ProfileCard />
                    <OnlineFriendsCard />
                </div>
            </div>
        </div>
    )
}

export default Left