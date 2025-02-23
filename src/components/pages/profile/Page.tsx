"use client";
import { useAuthContext } from "@/context/AuthContext";
import { Props } from "@/app/profile/[username]/page";
import ProfileBaseInformation from "./ProfileBaseInformations";

const Page = ({ params }: Props) => {
  const { user } = useAuthContext();
  return (
    <div className="max-w-[1420px] w-[90vw] flex flex-col items-center">
      <div className="mr-2 flex flex-col lg:flex-row md:flex-row mt-2 gap-2 w-full">
        {params ? (
          <ProfileBaseInformation
            // authTokens={authTokens}
            username={params?.username}
          />
        ) : (
          <ProfileBaseInformation
            // authTokens={authTokens}
            username={user?.username}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
