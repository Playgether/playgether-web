import React from "react";
import { CgProfile } from "react-icons/cg";
import Image from "next/legacy/image";

function NotificationsStructure({
  title,
  profile_photo,
  children,
}: {
  title: string;
  profile_photo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex justify-between">
      <div className=" flex items-center gap-2">
        <div className="rounded-full h-8 w-8  flex items-center relative">
          {profile_photo === null || profile_photo === undefined ? (
            <CgProfile className="h-full w-full text-gray-300" />
          ) : (
            <Image
              src={profile_photo}
              objectFit="cover"
              width={400}
              height={400}
              alt={"Imagem de perfil do card profile do feed"}
              className="rounded-full"
            />
          )}
        </div>
        <div>
          <a href="">
            <h1 className="font-medium NotificationWrapper-name text-sm">
              {title}
            </h1>
          </a>
        </div>
      </div>
      {children}
    </div>
  );
}

export default NotificationsStructure;
