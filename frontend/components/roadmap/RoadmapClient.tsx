"use client";

import { Map } from "lucide-react";
import { PromptWorkspace } from "@/components/ui/PromptWorkspace";

export function RoadmapClient() {
  return (
    <PromptWorkspace
      title="Your AI Career Roadmap"
      description="Generate a focused path that connects your current skills, projects, and career goal."
      inputLabel="What is your goal?"
      placeholder="Become a GenAI Engineer"
      examples={["Become a GenAI Engineer", "Move into AI product engineering", "Build an AI portfolio in 90 days"]}
      actionLabel="Generate Roadmap"
      emptyTitle="Roadmap output"
      emptyDescription="Your personalized roadmap will appear here after NEXUS responds."
      icon={<Map className="size-6" aria-hidden="true" />}
      buildMessage={(goal) => `Create a personalized roadmap for becoming ${goal}.`}
    />
  );
}
