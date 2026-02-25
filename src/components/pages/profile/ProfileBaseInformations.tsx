import { getProfileByUsername } from "@/services/getProfileByUsername";
import { LeftProfile } from "./LeftProfile";
import { RightProfile } from "./RightProfile";
import NotFoundProfile from "@/app/profile/[username]/not-found";

export default async function ProfileBaseInformation({ profile }) {
  // ⚠️ Componente não utilizado após repaginação visual do profile
  return (
    <>
      <LeftProfile profile={profile} />
      <RightProfile profile={profile} />
    </>
  );
}
