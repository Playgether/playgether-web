"use client";
import { useAuthContext } from "@/context/AuthContext";
import { LeftProfile } from "./LeftProfile";
import { RightProfile } from "./RightProfile";
import { Suspense, useEffect, useState } from "react";
import {
  getProfileByUsername,
  getProfileByUsernameProps,
} from "@/services/getProfileByUsername";
import NotFoundProfile from "@/app/profile/[username]/not-found";
import { Props } from "@/app/profile/[username]/page";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";

const Page = ({ params }: Props) => {
  const { authTokens, user } = useAuthContext();
  const [profile, setProfile] = useState<getProfileByUsernameProps | null>(
    null
  );

  async function fetchProfile(username: string) {
    const response = await getProfileByUsername(authTokens, username);
    setProfile(response.data[0]);
    return response;
  }

  useEffect(() => {
    console.log(`TESTE ${user?.username}`);
    if (params.username) {
      fetchProfile(params.username);
    } else {
      fetchProfile(user?.username);
    }
  }, [params.username, user?.username]);

  return (
    <div className="max-w-[1420px] w-[90vw] flex flex-col items-center">
      <div className="mr-2 flex flex-col lg:flex-row md:flex-row mt-2 gap-2 w-full">
        {profile ? (
          <>
            <LeftProfile profile={profile} />
            <Suspense fallback={<LoadingComponent />}>
              <RightProfile profile={profile} />
            </Suspense>
          </>
        ) : (
          <NotFoundProfile />
        )}
      </div>
    </div>
  );
};

export default Page;
