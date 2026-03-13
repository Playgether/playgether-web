"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { decodeUser } from "@/actions/decodeUser";
import { logoutServer } from "@/actions/logout";
import { refreshTokenServer } from "@/actions/refreshToken";

const REFRESH_INTERVAL_MS = 18 * 60 * 1000; // 18 min (antes dos 20 min de expiry do access)

export type UserProps = {
  username: string;
  user_id?: number;
  first_name: string;
  last_name: string;
};

type AuthContextProps = {
  user: UserProps | null;
  logout: () => void;
  isLoggedOut: boolean;
  setIsLoggedOut: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserProps | null>(null);
  const [isLoggedOut, setIsLoggedOut] = useState(true);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const logout = useCallback(async () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    setIsLoggedOut(true);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    await logoutServer();
    router.push("/");
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      const userLocalStorage =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const cachedUser = userLocalStorage ? JSON.parse(userLocalStorage) : null;
      if (cachedUser !== null) {
        setUser(cachedUser);
      } else {
        const user_decoded = await decodeUser();
        if (user_decoded) {
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user_decoded));
          }
          setUser(user_decoded);
        }
      }
    };
    fetchData();
  }, [isLoggedOut]);

  useEffect(() => {
    if (!user) return;

    const refreshTokens = async () => {
      const success = await refreshTokenServer();
      if (!success) {
        await logout();
      }
    };

    refreshIntervalRef.current = setInterval(refreshTokens, REFRESH_INTERVAL_MS);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [user, logout]);
  return (
    <AuthContext.Provider
      value={{
        user: user,
        logout,
        isLoggedOut,
        setIsLoggedOut,
      }}
    >
      <>{children}</>
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
export { AuthProvider, AuthContext };
