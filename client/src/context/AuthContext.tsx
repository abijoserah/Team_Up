import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

type AuthContextType = {
  auth: Auth | null;
  setAuth: Dispatch<SetStateAction<Auth | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Auth | null>(null);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return value;
};
