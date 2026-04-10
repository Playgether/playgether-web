"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { ProfileProps } from "@/types/ProfileProps";
import { getProfile } from "@/actions/getProfile";
import { useAuthContext } from "./AuthContext";

type ProfileContextProps = {
  profile: ProfileProps | null | undefined;
  fetchProfile: () => Promise<ProfileProps | null>;
};

const ProfileContext = createContext<ProfileContextProps>(
  {} as ProfileContextProps
);

const ProfileContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [profile, setProfile] = useState<ProfileProps | null | undefined>(
    undefined,
  );
  const { isLoggedOut } = useAuthContext();

  const fetchProfile = useCallback(async () => {
    const data = await getProfile();
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    if (isLoggedOut) {
      setProfile(undefined);
    }
  }, [isLoggedOut]);

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
