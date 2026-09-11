"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { askNexus } from "@/lib/api";
import { getThreadId } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { requestProgressRefresh } from "@/hooks/useProgress";
import { useUserId } from "@/hooks/useUserId";

type PromptWorkspaceProps = {
  title: string;
  description: string;
  inputLabel: string;
  placeholder: string;
  examples: string[];
  actionLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  icon: ReactNode;
  buildMessage: (input: string) => string;
};

export function PromptWorkspace({
  title,
  description,
  inputLabel,
  placeholder,
  examples,
  actionLabel,
  emptyTitle,
  emptyDescription,
  icon,
  buildMessage
}: PromptWorkspaceProps) {
  const { userId } = useUserId();
  const { showToast } = useToast();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPrompt = async (value = input) => {
    const trimmed = value.trim();
    if (!trimmed || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await askNexus(userId, buildMessage(trimmed), getThreadId());
      setResult(response.result);
      requestProgressRefresh();
    } catch (promptError) {
      const message =
        promptError instanceof Error
          ? promptError.message
          : "Something went wrong. Please check that the NEXUS AI backend is running.";
      setError(message);
      showToast({
        title: "NEXUS request failed",
        description: "Please check that the backend is running.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="rounded-lg border border-border/70 bg-panel/[0.68] p-5 backdrop-blur-xl sm:p-6"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
              {icon}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <Card>
          <CardBody>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void runPrompt();
              }}
            >
              <div>
                <label htmlFor="prompt-input" className="text-sm font-medium text-foreground">
                  {inputLabel}
                </label>
                <input
                  id="prompt-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={placeholder}
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background/70 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !input.trim()}
                icon={<ArrowRight className="size-4" aria-hidden="true" />}
                className="w-full"
              >
                {actionLabel}
              </Button>
            </form>

            <div className="mt-6">
              <p className="text-sm font-medium text-foreground">Examples</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setInput(example)}
                    className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition hover:border-accent/50 hover:text-foreground"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="min-h-[30rem]">
          <CardBody className="min-h-[30rem]">
            {loading ? (
              <div className="flex h-full min-h-[26rem] items-center justify-center">
                <Spinner label="NEXUS is composing" />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-danger/30 bg-danger/[0.08] p-4 text-sm text-danger">{error}</div>
            ) : result ? (
              <MarkdownRenderer content={result} />
            ) : (
              <div className="flex h-full min-h-[26rem] items-center justify-center text-center">
                <div>
                  <div className="mx-auto grid size-12 place-items-center rounded-lg border border-accent/30 bg-accent/[0.12] text-accent">
                    <Sparkles className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{emptyTitle}</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{emptyDescription}</p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
