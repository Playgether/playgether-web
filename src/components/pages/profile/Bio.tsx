import { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import { BioConquists } from "./BioConquists";
import { BioPerformance } from "./BioPerformance";

let text =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

export const Bio = ({
  profile,
}: {
  profile: getProfileByUsernameProps | null;
}) => {
  return (
    <div className="w-full h-full animate-menuProfileFadeIn Bio-wrapper">
      <div className="w-full h-[40vh] rounded-lg my-4 overflow-auto">
        <div className=" p-4 text-justify font-extralight h-full">
          {profile?.bio ? (
            <p>{profile.bio}</p>
          ) : (
            <div className="h-full w-full flex justify-center items-center">
              Este perfil não possui uma bio
            </div>
          )}
        </div>
      </div>
      <div className="flex w-full h-[300px] gap-4 justify-center items-center">
        <div className="relative w-[450px] h-full Bio-conquists rounded-lg overflow-y-auto shadow shadow-[var(--shadow-color)] border">
          <BioConquists />
        </div>
        <div className="h-full w-[450px] Bio-performance rounded-lg overflow-y-auto shadow shadow-[var(--shadow-color)] border">
          <BioPerformance profile={profile} />
        </div>
      </div>
    </div>
  );
};
