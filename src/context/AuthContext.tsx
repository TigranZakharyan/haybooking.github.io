// context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { authService } from "@/services/api";
import type { TUser } from "@/types";

interface AuthContextType {
  user: TUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      setLoading(true);
      const me = await authService.getMe();
      setUser(me.user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easier usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
