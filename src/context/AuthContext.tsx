"use client";

import { createContext, useContext, useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import { loginUser } from "../services/loginUser";
import { loginUserProps } from "../services/loginUser";
import { useRouter, usePathname } from "next/navigation";
import { updateTokenRequest, TokenData } from "../services/updateTokenRequest";
import { GiConsoleController } from "react-icons/gi";

export type UserProps = {
  username: string;
  user_id: number;
  first_name: string;
  last_name: string;
};

type AuthContextProps = {
  user: UserProps | undefined | null;
  login: (user: loginUserProps) => Promise<void>;
  logout: () => void;
  wrongPassword: string | null;
  authTokens: TokenData | null | undefined;
  isLoggedOut: boolean;
};

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [authTokens, setAuthTokens] = useState<TokenData | null>();
  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [wrongPassword, setWrongPassword] = useState<string | null>(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      const savedTokens = localStorage.getItem("authTokens");
      const initialTokenState = savedTokens ? JSON.parse(savedTokens) : null;
      const initialUserState = savedTokens
        ? (jwt_decode(savedTokens) as UserProps)
        : null;
      setAuthTokens(() => initialTokenState);
      setUser(() => initialUserState);
    }
    setLoading(false);
  }, []);

  const login = async (user: loginUserProps) => {
    const response = await loginUser(user);
    setWrongPassword(null);
    if (response?.status === 200) {
      const tokens = response.data;
      const user = response?.data.access;
      setAuthTokens(tokens);
      setUser(jwt_decode(user));
      localStorage.setItem("authTokens", JSON.stringify(tokens));
      router.push("/feed");
    } else {
      if (response?.response.status === 401) {
        const wrongText = "Username ou senha incorreta";
        setWrongPassword(wrongText);
      } else {
        alert("Algo deu errado !");
      }
    }
  };

  const logout = () => {
    setIsLoggedOut(true);
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    router.push("/");
  };

  const redirect = async () => {
    if (user && authTokens) {
      if (pathname === "/") {
        router.push("/feed");
      }
    } else if (!user && !authTokens && pathname !== "/") {
      router.push("/");
    }
  };

  useEffect(() => {
    if (!loading) {
      redirect();
    }
  }, [user, authTokens, loading]);

  const updateToken = async () => {
    if (authTokens && authTokens.refresh) {
      const response = await updateTokenRequest(authTokens);
      if (response?.status === 200) {
        const tokens = response.data;
        const user = response?.data.access;
        setAuthTokens(tokens);
        setUser(jwt_decode(user));
        localStorage.setItem("authTokens", JSON.stringify(tokens));
      } else {
        logout();
      }

      if (loading) {
        setLoading(false);
      }
    } else {
      return "Token inválido ou inexistente";
    }
  };

  useEffect(() => {
    if (authTokens) {
      if (loading) {
        updateToken();
      }
      const fourMinutes = 1000 * 60 * 4;
      const interval = setInterval(() => {
        updateToken();
      }, fourMinutes);

      return () => clearInterval(interval);
    }
  }, [authTokens, loading]);

  return (
    <AuthContext.Provider
      value={{
        user: user,
        login,
        logout,
        wrongPassword,
        authTokens,
        isLoggedOut,
      }}
    >
      <>{loading ? null : children}</>
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
export { AuthProvider, AuthContext };
