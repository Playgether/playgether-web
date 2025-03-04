"use client";
import React from "react";
import { SiValorant, SiCounterstrike } from "react-icons/si";
import { ProfileCardBio } from "./ProfileCardBio";
import { useAuthContext } from "../../../../../../context/AuthContext";
import DefaultButton from "../../../../../elements/DefaultButton/DefaultButton";
import { useRouter } from "next/navigation";
import ProfileImagePost from "../../Middle/PostsComponents/ProfileImagePost/ProfileImagePost";
import { CldUploadWidget } from "next-cloudinary";
import { IoCreateOutline } from "react-icons/io5";

/** Este componente é o wrapper principal do card de profile na página feed. Seu intuito é ser o wrapper de todo o card e seus componentes filhos. */
const ProfileCard = ({ children }: { children: React.ReactNode }) => {
  // const { user } = ();
  const { user } = useAuthContext();
  const route = useRouter();

  return (
    <div className=" ProfileCard-wrapper relative h-[400px] flex flex-col items-center justify-center space-y-2 w-[250px] 2xl:w-[250px] max-h-[350px] 2xl:max-h-[400px] rounded-2xl ">
      <div className="rounded-full h-20 w-20 flex items-center justify-center relative">
        <ProfileImagePost username={user?.username} className="h-full w-full" />
      </div>
      <CldUploadWidget
        signatureEndpoint="/api/signed-profile"
        options={{
          uploadPreset: "profile-images",
          multiple: false,
          tags: [`${user?.username}`, "profile", "image", "user"],
          singleUploadAutoClose: false,
        }}
      >
        {({ open }) => {
          return (
            <IoCreateOutline
              className="h-8 w-8 cursor-pointer absolute top-2 right-2"
              onClick={() => open()}
            />
          );
        }}
      </CldUploadWidget>
      <div className="text-center w-full">{children}</div>
      <ProfileCardBio />
      <div className="flex space-x-3">
        <SiValorant />
        <SiCounterstrike />
      </div>
      <div>
        <DefaultButton
          className="text-sm font-semibold xl:px-6 2xl:py-3 lg:px-6 lg:py-2"
          onClick={() => route.push("/profile")}
        >
          Ver Perfil
        </DefaultButton>
      </div>
    </div>
  );
};

export default ProfileCard;
