import React from "react";
import { SiValorant, SiCounterstrike } from "react-icons/si";

import { ProfileCardBio } from "./ProfileCardBio";

import Image from "next/legacy/image";
import { CgProfile } from "react-icons/cg";
import { useAuthContext } from "../../../../../../context/AuthContext";
import { useProfileContext } from "../../../../../../context/ProfileContext";
import DefaultButton from "../../../../../elements/DefaultButton/DefaultButton";
import { TopCard } from "../../MultUseComponents/TopCard";
import { CldUploadWidget } from "next-cloudinary";
import { IoCreateOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

/** Este componente é o wrapper principal do card de profile na página feed. Seu intuito é ser o wrapper de todo o card e seus componentes filhos. */
const ProfileCard = ({}) => {
  const { user } = useAuthContext();
  const { profile } = useProfileContext();
  const route = useRouter();

  return (
    <div className=" ProfileCard-wrapper h-[400px] flex flex-col items-center justify-center space-y-2 w-[250px] 2xl:w-[250px] max-h-[350px] 2xl:max-h-[400px] rounded-2xl ">
      {/* <TopCard title={"Profile"} /> */}
      <div className="rounded-full h-20 w-20 flex items-center justify-center relative">
        {profile?.profile_photo === null ||
        profile?.profile_photo === undefined ? (
          <CgProfile className="h-full w-full text-gray-300" />
        ) : (
          <Image
            src={`${profile?.profile_photo}`}
            width={400}
            height={400}
            alt={"Imagem de perfil do card profile do feed"}
            className="rounded-full"
          />
        )}
      </div>
      {/* <CldUploadWidget 
                signatureEndpoint="/api/signed-profile"
                options={{
                    uploadPreset:"profile-images",
                    multiple:false,
                    tags:[`${user?.username}`, "profile", "image", "user"],
                    singleUploadAutoClose:false
                }}
                >
                    {({ open }) => {
                        return (
                        <IoCreateOutline className='h-8 w-8 text-black-400 cursor-pointer absolute top-12 right-2' onClick={() => open()}/>
                        );
                    }}
            </CldUploadWidget> */}
      <div className="text-center w-full">
        <h1 className="text-xl">
          {user?.first_name} {user?.last_name}
        </h1>
        <p className="text-sm ProfileCard-username opacity-90">
          {user?.username}
        </p>
      </div>
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
