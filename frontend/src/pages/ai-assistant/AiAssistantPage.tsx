import { useRef, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clsx } from "@/utils/clsx";
import { useDepartments } from "@/api/departments";
import { streamChat, useGenerateInsights, type ChatMessage } from "@/api/aiAssistant";

const QUICK_ACTIONS = [
  "Summarize my ESG performance",
  "What are my top risks?",
  "How can I improve my social score?",
  "Suggest ways to reduce carbon emissions",
];

interface DisplayMessage extends ChatMessage {
  id: string;
  streaming?: boolean;
}

function ChatBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[75%] rounded-xl px-4 py-2 text-sm whitespace-pre-wrap",
          isUser
            ? "bg-eco-green text-white"
            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
        )}
      >
        {message.content || (message.streaming ? "…" : "")}
      </div>
    </div>
  );
}

function InsightsPanel() {
  const { data: departments } = useDepartments();
  const [departmentId, setDepartmentId] = useState("");
  const [open, setOpen] = useState(false);
  const insightsMutation = useGenerateInsights();

  return (
    <Card accent="teal">
      <button
        className="flex w-full items-center justify-between font-display font-semibold"
        onClick={() => setOpen((o) => !o)}
      >
        <span>Department Insights</span>
        <span className="text-neutral-400 text-sm">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Department</label>
              <select
                className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">Select a department</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              disabled={!departmentId || insightsMutation.isPending}
              onClick={() => departmentId && insightsMutation.mutate(departmentId)}
            >
              {insightsMutation.isPending ? "Generating..." : "Generate Insights"}
            </Button>
          </div>
          {insightsMutation.isError && (
            <p className="text-critical-red text-sm">Failed to generate insights.</p>
          )}
          {insightsMutation.data && (
            <Card className="bg-neutral-50 dark:bg-neutral-950">
              <p className="text-sm whitespace-pre-wrap">{insightsMutation.data}</p>
            </Card>
          )}
        </div>
      )}
    </Card>
  );
}

export function AiAssistantPage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingIdRef = useRef<string | null>(null);

  async function sendMessage(content: string) {
    if (!content.trim() || isStreaming) return;

    const userMessage: DisplayMessage = { id: crypto.randomUUID(), role: "user", content };
    const assistantId = crypto.randomUUID();
    streamingIdRef.current = assistantId;

    const history = [...messages, userMessage];
    setMessages([...history, { id: assistantId, role: "assistant", content: "", streaming: true }]);
    setInput("");
    setIsStreaming(true);

    await streamChat(
      history.map((m) => ({ role: m.role, content: m.content })),
      (delta) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + delta } : m))
        );
      },
      (error) => {
        setIsStreaming(false);
        streamingIdRef.current = null;
        if (error) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content || `Error: ${error}`, streaming: false }
                : m
            )
          );
        } else {
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m)));
        }
      }
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <h1 className="text-2xl font-display font-bold">AI Assistant</h1>

      <InsightsPanel />

      <Card className="flex flex-col gap-4">
        <h2 className="font-display font-semibold">Chat</h2>

        <div className="flex flex-col gap-3 min-h-[300px] max-h-[500px] overflow-y-auto p-2">
          {messages.length === 0 && (
            <p className="text-neutral-400 text-sm">
              Ask me anything about your organization's ESG data and performance.
            </p>
          )}
          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => setInput(action)}
              className="text-xs rounded-full px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isStreaming}
            />
          </div>
          <Button type="submit" disabled={isStreaming || !input.trim()}>
            {isStreaming ? "Sending..." : "Send"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
