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

// Renova 10 min antes do access token de 60 min (produção) expirar.
// Em dev (30 dias) é mais frequente que o necessário, mas inofensivo.
const REFRESH_INTERVAL_MS = 50 * 60 * 1000; // 50 min
/** Mínimo entre refreshes ao voltar à aba (evita spam em alt-tab rápido). */
const VISIBILITY_REFRESH_MIN_GAP_MS = 5 * 60 * 1000; // 5 min

export type UserProps = {
  username: string;
  user_id?: string;
  first_name: string;
  last_name: string;
};

type AuthContextProps = {
  user: UserProps | null;
  logout: () => void;
  isLoggedOut: boolean;
  setIsLoggedOut: (value: boolean) => void;
  /** true após a primeira verificação de sessão (JWT / cache) no cliente. */
  authSessionResolved: boolean;
};

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserProps | null>(null);
  const [isLoggedOut, setIsLoggedOut] = useState(true);
  const [authSessionResolved, setAuthSessionResolved] = useState(false);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Última vez que o access foi renovado com sucesso (intervalo, foco na aba ou bootstrap). */
  const lastAccessRefreshAtRef = useRef<number>(0);

  const markAccessRefreshed = useCallback(() => {
    lastAccessRefreshAtRef.current = Date.now();
  }, []);

  const logout = useCallback(async () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    setIsLoggedOut(true);
    setUser(null);
    lastAccessRefreshAtRef.current = 0;
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    await logoutServer();
    router.push("/");
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setAuthSessionResolved(false);
      const userLocalStorage =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const cachedUser = userLocalStorage ? JSON.parse(userLocalStorage) : null;
      let fromJwt = await decodeUser();
      if (!fromJwt) {
        const renewed = await refreshTokenServer();
        if (renewed) {
          markAccessRefreshed();
          fromJwt = await decodeUser();
        }
      }
      if (cancelled) return;
      if (cachedUser !== null) {
        const merged: UserProps = {
          ...cachedUser,
          user_id: fromJwt?.user_id ?? cachedUser.user_id,
          username: fromJwt?.username ?? cachedUser.username,
          first_name: fromJwt?.first_name ?? cachedUser.first_name,
          last_name: fromJwt?.last_name ?? cachedUser.last_name,
        };
        setUser(merged);
        setIsLoggedOut(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(merged));
        }
        markAccessRefreshed();
      } else if (fromJwt) {
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(fromJwt));
        }
        setUser(fromJwt);
        setIsLoggedOut(false);
        markAccessRefreshed();
      } else {
        setUser(null);
        setIsLoggedOut(true);
      }
      if (!cancelled) setAuthSessionResolved(true);
    };
    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [isLoggedOut, markAccessRefreshed]);

  useEffect(() => {
    if (!user) return;

    const refreshTokens = async () => {
      const success = await refreshTokenServer();
      if (!success) {
        await logout();
      } else {
        markAccessRefreshed();
      }
    };

    refreshIntervalRef.current = setInterval(refreshTokens, REFRESH_INTERVAL_MS);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [user, logout, markAccessRefreshed]);

  /**
   * Ao voltar à aba: renova o access só se já passou tempo suficiente desde a última renovação
   * (o intervalo de 18 min já cobre o caso “aba aberta”; aqui evita alt-tab repetido sem critério).
   */
  useEffect(() => {
    if (!user) return;
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      const elapsed = Date.now() - lastAccessRefreshAtRef.current;
      if (elapsed < VISIBILITY_REFRESH_MIN_GAP_MS) return;
      void (async () => {
        const success = await refreshTokenServer();
        if (!success) await logout();
        else markAccessRefreshed();
      })();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [user, logout, markAccessRefreshed]);
  return (
    <AuthContext.Provider
      value={{
        user: user,
        logout,
        isLoggedOut,
        setIsLoggedOut,
        authSessionResolved,
      }}
    >
      <>{children}</>
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
export { AuthProvider, AuthContext };
