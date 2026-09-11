"use client";

import { GraduationCap } from "lucide-react";
import { PromptWorkspace } from "@/components/ui/PromptWorkspace";

export function LearningClient() {
  return (
    <PromptWorkspace
      title="Learning Center"
      description="Ask NEXUS to teach a topic through concepts, practice, projects, mistakes, and next steps."
      inputLabel="What do you want to learn?"
      placeholder="RAG"
      examples={["RAG", "LangGraph", "Transformers", "PyTorch", "FastAPI"]}
      actionLabel="Start Learning"
      emptyTitle="Learning plan"
      emptyDescription="NEXUS will structure the lesson after you choose a topic."
      icon={<GraduationCap className="size-6" aria-hidden="true" />}
      buildMessage={(topic) =>
        `Teach me ${topic} based on my current progress. Include concepts, learning order, practice, mini projects, common mistakes, and the next step.`
      }
    />
  );
}
