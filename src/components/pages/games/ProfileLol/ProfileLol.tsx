import React from "react";

import { useProfileLolContext } from "../../../../context/ProfileLolContext";
import { ProfileLolProps } from "../../../../services/getProfileLol";
import { useResource } from "../../../custom_hooks/useResource";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ProfileLol = ({}) => {
  const { profile, fetchProfile } = useProfileLolContext();
  useResource<ProfileLolProps>(() => fetchProfile());
  const soloQueue = profile?.ranked?.queues?.RANKED_SOLO_5x5 ?? null;
  const flexQueue = profile?.ranked?.queues?.RANKED_FLEX_SR ?? null;

  return (
    <>
      <div className="mt-[-3rem]">
        <h1 className="ProfileLol-title text-3xl text-center font-extrabold">
          League of Legends
        </h1>
      </div>

      <div className="w-full flex justify-center mt-[3rem]">
        <Card className="ProfileLol-background-cards w-[26rem]">
          <CardHeader>
            <CardTitle className="text-center font-extrabold text-xl">
              Riot ID
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row items-center justify-center text-xl font-extrabold gap-2">
            <h1>{profile?.account?.gameName ?? "Sem conta"}</h1>
            <h1>#{profile?.account?.tagLine ?? "-"}</h1>
          </CardContent>
        </Card>
      </div>

      <div className="w-full flex justify-evenly mt-[2rem]">
        <Card className="ProfileLol-background-cards w-[22rem]">
          <CardHeader>
            <CardTitle className="text-center font-extrabold text-xl">
              SoloQ
            </CardTitle>
          </CardHeader>
          <div className="border-t border-zinc-700 w-full"></div>

          <CardContent className="flex flex-col items-center justify-center text-xl font-extrabold gap-2 mt-10">
            <h1>{soloQueue?.label ?? "Sem dados"}</h1>

            <Avatar className="w-[60px] h-[60px] mt-5">
              <AvatarImage src="https://github.com/shadcn.png" alt="avatar" />
              <AvatarFallback>Rank Logo</AvatarFallback>
            </Avatar>

            <h1
              className={(soloQueue?.winRate ?? 0) >= 50 ? "text-[#24FF00]" : "text-red-500"}
            >
              {soloQueue ? `${soloQueue.winRate}%` : "0%"}
            </h1>

            <h1>{soloQueue ? `${soloQueue.leaguePoints} PDL` : "0 PDL"}</h1>

            <div className="flex justify-between w-[40%] my-8">
              <h1 className="text-[#24FF00]">{soloQueue ? `${soloQueue.wins} V` : "0 V"}</h1>
              <h1 className="text-red-500">{soloQueue ? `${soloQueue.losses} D` : "0 D"}</h1>
            </div>
          </CardContent>
        </Card>

        <Card className="ProfileLol-background-cards w-[22rem]">
          <CardHeader>
            <CardTitle className="text-center font-extrabold text-xl">
              Flex
            </CardTitle>
          </CardHeader>
          <div className="border-t border-zinc-700 w-full"></div>

          <CardContent className="flex flex-col items-center justify-center text-xl font-extrabold gap-2 mt-10">
            <h1>{flexQueue?.label ?? "Sem dados"}</h1>

            <Avatar className="w-[60px] h-[60px] mt-5">
              <AvatarImage src="https://github.com/shadcn.png" alt="avatar" />
              <AvatarFallback>Rank Logo</AvatarFallback>
            </Avatar>

            <h1
              className={(flexQueue?.winRate ?? 0) >= 50 ? "text-[#24FF00]" : "text-red-500"}
            >
              {flexQueue ? `${flexQueue.winRate}%` : "0%"}
            </h1>

            <h1>{flexQueue ? `${flexQueue.leaguePoints} PDL` : "0 PDL"}</h1>

            <div className="flex justify-between w-[40%] my-8">
              <h1 className="text-[#24FF00]">{flexQueue ? `${flexQueue.wins} V` : "0 V"}</h1>
              <h1 className="text-red-500">{flexQueue ? `${flexQueue.losses} D` : "0 D"}</h1>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ProfileLol;
