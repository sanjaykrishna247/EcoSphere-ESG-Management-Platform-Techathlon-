import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import { resolveMock } from "@/mocks/resolver";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
const MOCK_FALLBACK_ENABLED = import.meta.env.VITE_DISABLE_MOCK_FALLBACK !== "true";

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Track whether we have confirmed the backend is reachable ──────────
let backendStatus: "unknown" | "reachable" | "unreachable" = "unknown";

/** Resolve a mock AxiosResponse for the given failed request config. */
function buildMockResponse(config: InternalAxiosRequestConfig): AxiosResponse {
  let parsedData = undefined;
  if (config.data) {
    try {
      parsedData = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    } catch {
      parsedData = config.data;
    }
  }

  const mockData = resolveMock(
    config.method ?? "GET",
    config.url ?? "",
    parsedData
  );
  return {
    data: mockData,
    status: 200,
    statusText: "OK (mock)",
    headers: {},
    config,
  };
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await axios.post(`${BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  });
  const { access_token, refresh_token } = response.data.data;
  useAuthStore.getState().setTokens(access_token, refresh_token);
  return access_token;
}

api.interceptors.response.use(
  (response) => {
    // Backend responded — mark it reachable
    if (backendStatus !== "reachable") {
      backendStatus = "reachable";
      console.info("[API] Backend is reachable — using real data.");
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // ── Network error / backend unreachable → fall back to mock ──────────
    const isNetworkError = !error.response ||
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNREFUSED" ||
      error.message === "Network Error";

    if (isNetworkError && MOCK_FALLBACK_ENABLED) {
      if (backendStatus !== "unreachable") {
        backendStatus = "unreachable";
        console.warn(
          "[API] Backend unreachable — falling back to mock data. " +
          "Set VITE_DISABLE_MOCK_FALLBACK=true to disable this behaviour."
        );
      }
      return buildMockResponse(originalRequest);
    }

    // ── 401 / expired token → try refresh ────────────────────────────────
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      useAuthStore.getState().refreshToken &&
      useAuthStore.getState().accessToken !== "mock-dev-token"
    ) {
      originalRequest._retry = true;
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        refreshPromise = null;
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
