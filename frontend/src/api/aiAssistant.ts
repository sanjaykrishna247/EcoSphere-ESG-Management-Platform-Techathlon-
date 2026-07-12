import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import type { SuccessResponse } from "@/types/api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

/**
 * Streams a chat completion from POST /ai/chat using raw fetch (SSE), since the
 * shared axios instance doesn't expose incremental streaming. Calls onDelta for
 * each text chunk received and onDone when the stream completes or errors.
 */
export async function streamChat(
  messages: ChatMessage[],
  onDelta: (delta: string) => void,
  onDone: (error?: string) => void
): Promise<void> {
  const token = useAuthStore.getState().accessToken;

  try {
    const response = await fetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok || !response.body) {
      onDone(`Request failed with status ${response.status}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const jsonStr = trimmed.slice("data:".length).trim();
        if (!jsonStr) continue;
        try {
          const payload = JSON.parse(jsonStr) as { delta?: string; done?: boolean; error?: string };
          if (payload.error) {
            onDone(payload.error);
            return;
          }
          if (payload.delta) {
            onDelta(payload.delta);
          }
          if (payload.done) {
            onDone();
            return;
          }
        } catch {
          // ignore malformed chunk
        }
      }
    }
    onDone();
  } catch (err) {
    onDone(err instanceof Error ? err.message : "Streaming failed");
  }
}

export function useGenerateInsights() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (departmentId: string) => {
      const res = await api.post<SuccessResponse<string>>(`/ai/insights/${departmentId}`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai", "insights"] });
    },
  });
}
