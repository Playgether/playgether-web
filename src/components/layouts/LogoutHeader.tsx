"use client";
import { useAuthContext } from "../../context/AuthContext";

const LogoutHeader = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuthContext();

  return (
    <>
      <p className="lg:hidden text-xl" onClick={() => logout()}>
        Logout
      </p>
      <button onClick={() => logout()} className="h-full w-full">
        {children}
      </button>
    </>
  );
};

export default LogoutHeader;
