import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "admin" | "manager" | "employee";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id: string | null;
  xp_points: number;
  total_points: number;
  avatar_url: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: "ecosphere-auth" }
  )
);
