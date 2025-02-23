"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { loginUserProps } from "../services/loginUser";
import { useRouter } from "next/navigation";
import { decodeUser } from "@/actions/decodeUser";
import { logoutServer } from "@/actions/logout";

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
  setIsLoggedOut: (boolean) => void;
};

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserProps | null>(null);
  const [isLoggedOut, setIsLoggedOut] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userLocalStorage = localStorage.getItem("user");
      const user = userLocalStorage ? JSON.parse(userLocalStorage) : null;
      if (user !== null) {
        setUser(user);
      } else {
        const user_decoded = await decodeUser();
        if (user_decoded) {
          localStorage.setItem("user", JSON.stringify(user_decoded));
          setUser(user_decoded);
        }
      }
    };
    fetchData();
  }, [isLoggedOut]);

  async function logout() {
    setIsLoggedOut(true);
    setUser(null);
    localStorage.removeItem("user");
    await logoutServer();
    router.push("/");
  }

  // const updateToken = async () => {
  //   if (authTokens && authTokens.refresh) {
  //     const response = await updateTokenRequest(authTokens);
  //     if (response?.status === 200) {
  //       const tokens = response.data;
  //       const user = response?.data.access;
  //       setAuthTokens(tokens);
  //       setUser(jwt_decode(user));
  //       localStorage.setItem("authTokens", JSON.stringify(tokens));
  //     } else {
  //       logout();
  //     }

  //     if (loading) {
  //       setLoading(false);
  //     }
  //   } else {
  //     return "Token inválido ou inexistente";
  //   }
  // };
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
