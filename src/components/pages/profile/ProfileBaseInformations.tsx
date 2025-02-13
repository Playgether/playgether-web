import { getProfileByUsername } from "@/services/getProfileByUsername";
import { LeftProfile } from "./LeftProfile";
import { RightProfile } from "./RightProfile";
import NotFoundProfile from "@/app/profile/[username]/not-found";

export default async function ProfileBaseInformation({ authTokens, username }) {
  const response = await getProfileByUsername(authTokens, username);
  const profile = response.data[0];
  return (
    <>
      {profile ? (
        <>
          <LeftProfile profile={profile} />
          <RightProfile profile={profile} />
        </>
      ) : (
        <NotFoundProfile />
      )}
    </>
  );
}
