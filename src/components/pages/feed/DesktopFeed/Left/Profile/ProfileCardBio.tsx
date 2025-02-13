import { Suspense } from "react";
import TextLimitComponent from "../../../../../layouts/SuspenseFallBack/TextLimitComponent/TextLimitComponent";
import { useProfileContext } from "../../../../../../context/ProfileContext";

/** Este é o wrapper do texto da bio da página de feed, seu intuito é exibir o texto da forma pré definida */
export const ProfileCardBio = () => {
  const { profile } = useProfileContext();
  return (
    <>
      <Suspense fallback={<div>Loading page, hopefully not too much..</div>}>
        <div className="w-5/6  text-xs text-center ProfileCardBio-wrapper opacity-90">
          {profile && profile.bio ? (
            <TextLimitComponent text={`${profile?.bio}`} maxCharacters={100} />
          ) : (
            "Você não possui uma bio, insira uma."
          )}
        </div>
      </Suspense>
    </>
  );
};
