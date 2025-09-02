import { createContext } from 'react';


interface User {
  id: string;
  username: string;
  email: string;
  role?: string; // Add role for admin/user
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
