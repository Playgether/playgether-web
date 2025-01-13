import { ProfileContextProvider } from "../../../../../context/ProfileContext";
import OnlineFriendsCard from "./OnlineFriends/OnlineFriendsCard";
import ProfileCard from "./Profile/ProfileCard";

/** Este componente é o wrapper principal da parte "Left" no componente de feed */
const Left = () => {
  return (
    <div className="flex flex-row space-x-2 w-full h-full 2xl:h-fit 2xl:sticky 2xl:top-16">
      <div className="flex-1 flex flex-col space-y-4 items-end gap-2 h-full">
        <ProfileCard />
        <div className="sticky top-[calc(4rem+16px)] 2xl:top-0 2xl:static">
          <OnlineFriendsCard />
        </div>
      </div>
    </div>
  );
};

export default Left;
