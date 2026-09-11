"use client";

import { motion } from "framer-motion";
import { clampProgress } from "@/lib/utils";

type CircularScoreProps = {
  value: number;
  label?: string;
};

export function CircularScore({ value, label = "Match" }: CircularScoreProps) {
  const score = clampProgress(value);
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative grid size-44 place-items-center">
      <svg className="size-44 -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
        <circle cx="64" cy="64" r="52" fill="none" stroke="rgb(var(--muted))" strokeWidth="12" />
        <motion.circle
          cx="64"
          cy="64"
          r="52"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="18" x2="118" y1="18" y2="118">
            <stop stopColor="rgb(var(--accent))" />
            <stop offset="1" stopColor="rgb(var(--success))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-4xl font-semibold text-foreground">{score}%</div>
          <div className="mt-1 text-sm text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}
