"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { ProfileProps } from "@/types/ProfileProps";
import { getProfile } from "@/actions/getProfile";
import { useAuthContext } from "./AuthContext";

type ProfileContextProps = {
  profile: ProfileProps | null | void;
  fetchProfile: () => Promise<ProfileProps>;
};

const ProfileContext = createContext<ProfileContextProps>(
  {} as ProfileContextProps
);

const ProfileContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [profile, setProfile] = useState<ProfileProps | void | null>();
  const { user, isLoggedOut } = useAuthContext();

  async function fetchProfile() {
    const response = await getProfile();
    setProfile(response.data);
    return response;
  }

  // useEffect(() => {
  //   if (!profile?.id && user) {
  //     fetchProfile();
  //   }
  // }, [user, isLoggedOut]);

  return (
    <ProfileContext.Provider value={{ profile, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

const useProfileContext = () => {
  const context = useContext(ProfileContext);
  return context;
};

export { ProfileContextProvider, useProfileContext, ProfileContext };
