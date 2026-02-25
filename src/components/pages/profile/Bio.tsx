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
    <div className="w-full animate-menuProfileFadeIn space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-card-foreground">Sobre mim</h3>
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          {profile?.bio ? (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              Este perfil não possui uma bio
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden shadow-card">
          <BioConquists />
        </div>
        <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden shadow-card">
          <BioPerformance profile={profile} />
        </div>
      </div>
    </div>
  );
};
