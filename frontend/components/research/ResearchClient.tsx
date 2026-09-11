"use client";

import { Search } from "lucide-react";
import { PromptWorkspace } from "@/components/ui/PromptWorkspace";

export function ResearchClient() {
  return (
    <PromptWorkspace
      title="AI Research"
      description="Use the backend research agent to gather and synthesize current AI career and engineering information."
      inputLabel="What do you want to research?"
      placeholder="Latest LangGraph features"
      examples={[
        "Latest LangGraph features",
        "Best RAG architectures",
        "Latest GenAI frameworks",
        "AI engineering career trends"
      ]}
      actionLabel="Research"
      emptyTitle="Research result"
      emptyDescription="NEXUS will show sourced research and synthesis here when the backend responds."
      icon={<Search className="size-6" aria-hidden="true" />}
      buildMessage={(topic) => `Research ${topic}. Summarize the key findings, useful links, and practical takeaways.`}
    />
  );
}
