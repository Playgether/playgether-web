"use client";

import { useState } from "react";
import { MenuProfile } from "./MenuProfile";
import { TextsProfilePosts } from "./TextsProfilePosts";
import { Medias } from "./Medias";
import { Bio } from "./Bio";
import { Conquists } from "./Conquists";
import { Statistics } from "./Statistics";
import { Moments } from "./Moments";
import { Game } from "./Game";
import { getProfileByUsernameProps } from "@/services/getProfileByUsername";

export const RightProfile = ({
  profile,
}: {
  profile: getProfileByUsernameProps | null;
}) => {
  const [content, setContent] = useState("bio");

  return (
    <div className="w-full min-h-[90vh]">
      <MenuProfile setContent={setContent} content={content} />
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="p-6">
          {content === "bio" && <Bio profile={profile} />}
          {content === "medias" && <Medias />}
          {content === "textos" && <TextsProfilePosts />}
          {content === "estatisticas" && <Statistics />}
          {content === "conquistas" && <Conquists />}
          {content === "marcos" && <Moments />}
          {content === "jogos" && <Game />}
        </div>
      </div>
    </div>
  );
};
