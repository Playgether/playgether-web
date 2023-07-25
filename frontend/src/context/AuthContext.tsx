

import { createContext, useContext, useState } from "react";
import { login } from "../services/loginUser";
import jwt_decode from 'jwt-decode';
import { loginUser } from "../services/loginUser";

export type UserProps = {
  name: string;
  token: string;
};

type AuthContextProps = {
  user: UserProps | null;
  login: (user: UserProps) => void;
  logout: () => void;
}


const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<UserProps | null>({
    name: 'Junior',
    token: '123',
  });

  const login = (user: UserProps) => {
    setUser(user);
    console.log(user);
  };

  const logout = () => {
    console.log('logout');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout
    }}>
      <>{children}</>
    </AuthContext.Provider>
  )
}

export const useAuthContext =  () => useContext(AuthContext);
export {AuthProvider};

// const AuthContext = createContext<loginUser>({
//     username: '',
//     password: '',
// });

// export default AuthContext;

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [authTokens, setAuthTokens] = useState(null);

//   const loginUser = async (e, data) => {
//     try {
//       const response = await login(data); 
//       setAuthTokens(response);
//       setUser(jwt_decode(response.access));
//     } catch {
//       alert('Algo não deu certo');
//     }
//   };

//   const contextData = {
//     loginUser: loginUser,
//   };
// };