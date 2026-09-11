"use client";

import { motion } from "framer-motion";
import { clampProgress, cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  label?: string;
  tone?: "accent" | "success" | "warning" | "danger";
  className?: string;
};

const toneClasses: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  accent: "from-accent to-success",
  success: "from-success to-accent",
  warning: "from-warning to-accent",
  danger: "from-danger to-warning"
};

export function ProgressBar({ value, label, tone = "accent", className }: ProgressBarProps) {
  const progress = clampProgress(value);

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="min-w-0 truncate text-muted-foreground">{label}</span>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
      ) : null}
      <div
        className="h-2.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className={cn("h-full rounded-full bg-gradient-to-r", toneClasses[tone])}
        />
      </div>
    </div>
  );
}
