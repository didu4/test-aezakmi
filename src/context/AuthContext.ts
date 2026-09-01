import { createContext } from "react";
import type { User, LoginCredentials } from "../types";

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Создаем контекст
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
