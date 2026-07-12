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

const MOCK_USER: AuthUser = {
  id: "mock-admin-id",
  email: "admin@ecosphere.com",
  full_name: "EcoSphere Admin",
  role: "admin",
  department_id: "mock-dept-id",
  xp_points: 1000,
  total_points: 1000,
  avatar_url: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: "mock-dev-token",
      refreshToken: "mock-dev-refresh-token",
      user: MOCK_USER,
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: "mock-dev-token", refreshToken: "mock-dev-refresh-token", user: MOCK_USER }),
    }),
    { name: "ecosphere-auth-mock" }
  )
);
