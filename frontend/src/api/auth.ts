import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useAuthStore, type AuthUser } from "@/store/authStore";
import type { SuccessResponse } from "@/types/api";

interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const res = await api.post<SuccessResponse<TokenPair>>("/auth/login", payload);
      return res.data.data;
    },
    onSuccess: async (tokens) => {
      setTokens(tokens.access_token, tokens.refresh_token);
      const me = await api.get<SuccessResponse<AuthUser>>("/auth/me");
      setUser(me.data.data);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      full_name: string;
    }) => {
      const res = await api.post<SuccessResponse<AuthUser>>("/auth/register", payload);
      return res.data.data;
    },
  });
}

export function useCurrentUser() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<AuthUser>>("/auth/me");
      setUser(res.data.data);
      return res.data.data;
    },
    enabled: !!accessToken,
    retry: false,
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
  };
}
