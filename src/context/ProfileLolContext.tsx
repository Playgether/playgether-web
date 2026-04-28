"use client";

import { createContext, useState, useContext } from "react";
import { getProfileLol } from "../services/getProfileLol";
import { useAuthContext } from "./AuthContext";
import { ProfileLolProps } from "../services/getProfileLol";

type ProfileLolContextProps = {
  profile: ProfileLolProps | null;
  fetchProfile: () => Promise<void>;
};

const ProfileLolContext = createContext<ProfileLolContextProps>(
  {} as ProfileLolContextProps,
);

const ProfileLolContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<ProfileLolProps | null>(null);

  async function fetchProfile() {
    const response = await getProfileLol(undefined, user?.user_id);
    setProfile(response);
  }

  return (
    <ProfileLolContext.Provider value={{ profile, fetchProfile }}>
      {children}
    </ProfileLolContext.Provider>
  );
};

const useProfileLolContext = () => {
  const context = useContext(ProfileLolContext);
  return context;
};

export { ProfileLolContextProvider, useProfileLolContext, ProfileLolContext };
