import { createContext, useContext, useEffect, useState } from "react";
import jwt_decode from 'jwt-decode';
import { loginUser } from "../services/loginUser";
import { loginUserProps } from "../services/loginUser";

export type UserProps = {
  username: string;
  token: string;
};

type AuthContextProps = {
  user: UserProps | null;
  login: (user: loginUserProps) => void;
  logout: () => void;
}


const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<UserProps | null>({
    username:"test",
    token:"test"
  } as UserProps);
  const [authTokens, setAuthTokens] = useState<UserProps | null>({} as UserProps);
  const [loading, setLoading] = useState(true);


  const login = async (user: loginUserProps) => {
    const response = await loginUser(user)
    if (response?.status === 200){
      setAuthTokens(response.data)
      setUser(jwt_decode(response?.data.access))
    } else {
      alert('Algo deu errado')
    }
    console.log(user.username)
  };

  useEffect(() => {
    setLoading(false);
  }, []);


  const logout = () => {
    console.log('logout');
  };

  return (
    <AuthContext.Provider value={{
      user:user,
      login,
      logout
    }}>
      <>{!loading && children}</>
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