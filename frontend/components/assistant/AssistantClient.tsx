"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Bot, Plus, Send, Sparkles, UserRound } from "lucide-react";
import { askNexus } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";
import { createId, getThreadId, startNewThread } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { requestProgressRefresh } from "@/hooks/useProgress";
import { useUserId } from "@/hooks/useUserId";
import { cn } from "@/lib/utils";

const starterPrompts = [
  "Create my AI roadmap",
  "What should I learn next?",
  "Analyze my career path",
  "Help me prepare for interviews",
  "Research the latest GenAI technologies",
  "Explain RAG to me"
];

export function AssistantClient() {
  const { userId } = useUserId();
  const { showToast } = useToast();
  const [threadId, setThreadIdState] = useState("default");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setThreadIdState(getThreadId());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || loading) {
        return;
      }

      const activeThreadId = getThreadId();
      setThreadIdState(activeThreadId);

      const userMessage: ChatMessage = {
        id: createId("message"),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString()
      };

      setMessages((current) => [...current, userMessage]);
      setDraft("");
      setLoading(true);
      setError(null);

      try {
        const response = await askNexus(userId, trimmed, activeThreadId);
        const assistantMessage: ChatMessage = {
          id: createId("message"),
          role: "assistant",
          content: response.result,
          createdAt: new Date().toISOString()
        };

        setMessages((current) => [...current, assistantMessage]);
        requestProgressRefresh();
      } catch (sendError) {
        const message =
          sendError instanceof Error
            ? sendError.message
            : "Something went wrong. Please check that the NEXUS AI backend is running.";
        setError(message);
        showToast({
          title: "Assistant request failed",
          description: "Please check that the NEXUS AI backend is running.",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    },
    [loading, showToast, userId]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(draft);
  };

  const handleNewChat = () => {
    const nextThreadId = startNewThread();
    setThreadIdState(nextThreadId);
    setMessages([]);
    setDraft("");
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className="grid min-h-[calc(100vh-7rem)] gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <Card className="flex min-h-[calc(100vh-7rem)] flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-border/70 p-5">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-foreground">NEXUS AI Assistant</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your personal AI career and learning agent</p>
          </div>
          <Button
            variant="secondary"
            onClick={handleNewChat}
            icon={<Plus className="size-4" aria-hidden="true" />}
          >
            New Chat
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 app-scrollbar sm:p-6">
          {messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center py-12">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-3xl text-center"
              >
                <div className="mx-auto grid size-14 place-items-center rounded-lg border border-accent/30 bg-accent/[0.12] text-accent">
                  <Sparkles className="size-7" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-foreground">Ask NEXUS anything</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                  Get career direction, learning plans, project critique, interview prep, or RAG-backed answers from your uploaded documents.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="rounded-lg border border-border bg-muted/45 px-4 py-3 text-left text-sm text-foreground transition hover:border-accent/50 hover:bg-muted"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {loading ? (
                <div className="flex justify-start">
                  <div className="max-w-[82%] rounded-lg border border-border bg-muted/45 px-4 py-3">
                    <Spinner label="NEXUS is thinking" />
                  </div>
                </div>
              ) : null}
              <div ref={scrollRef} />
            </div>
          )}
        </div>

        {error ? (
          <div className="border-t border-danger/30 bg-danger/[0.08] px-5 py-3 text-sm text-danger">{error}</div>
        ) : null}

        <form onSubmit={handleSubmit} className="border-t border-border/70 bg-panel/[0.86] p-4">
          <label htmlFor="assistant-message" className="sr-only">
            Ask NEXUS anything
          </label>
          <div className="flex items-end gap-3 rounded-lg border border-border bg-background/70 p-2">
            <textarea
              id="assistant-message"
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(draft);
                }
              }}
              placeholder="Ask NEXUS anything..."
              rows={1}
              className="max-h-36 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              disabled={loading}
            />
            <Button
              type="submit"
              className="size-10 p-0"
              disabled={loading || !draft.trim()}
              aria-label="Send message"
            >
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </Card>

      <aside className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Bot className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Conversation Memory</h3>
              <p className="text-sm text-muted-foreground">Current browser thread</p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-muted/35 p-3 text-xs text-muted-foreground">
            <span className="block truncate">{threadId}</span>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-foreground">Strong starting points</h3>
          <div className="mt-4 space-y-2">
            {starterPrompts.slice(0, 4).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                className="w-full rounded-lg border border-border bg-muted/35 px-3 py-2 text-left text-sm text-muted-foreground transition hover:border-accent/50 hover:text-foreground disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </Card>
      </aside>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser ? (
        <div className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-accent/30 bg-accent/[0.12] text-accent">
          <Bot className="size-4" aria-hidden="true" />
        </div>
      ) : null}
      <div
        className={cn(
          "max-w-[88%] rounded-lg px-4 py-3 text-sm sm:max-w-[78%]",
          isUser
            ? "bg-accent text-accent-foreground"
            : "border border-border bg-muted/45 text-foreground"
        )}
      >
        {isUser ? <p className="whitespace-pre-wrap">{message.content}</p> : <MarkdownRenderer content={message.content} />}
      </div>
      {isUser ? (
        <div className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-border bg-panel text-muted-foreground">
          <UserRound className="size-4" aria-hidden="true" />
        </div>
      ) : null}
    </motion.div>
  );
}
