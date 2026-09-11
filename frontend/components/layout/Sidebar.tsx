"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, ChevronRight, Settings, Sparkles } from "lucide-react";
import { navigationItems, productStats } from "@/components/layout/navigation";
import { useUserId } from "@/hooks/useUserId";
import { cn } from "@/lib/utils";

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { userId } = useUserId();

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-border/70 bg-panel/[0.72] px-4 py-4 backdrop-blur-xl">
      <Link href="/dashboard" className="mb-5 flex items-center gap-3 rounded-lg px-2 py-2" onClick={onNavigate}>
        <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Bot className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-semibold text-foreground">NEXUS AI</span>
          <span className="block text-xs text-muted-foreground">Career intelligence</span>
        </span>
      </Link>

      <div className="mb-4 rounded-lg border border-border/60 bg-muted/40 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="size-4 text-accent" aria-hidden="true" />
          Unified agent workspace
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {productStats.map((stat) => (
            <span key={stat} className="rounded-md border border-border/50 bg-panel/70 px-2 py-1.5">
              {stat}
            </span>
          ))}
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 app-scrollbar" aria-label="Primary navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <ChevronRight
                className={cn(
                  "size-4 shrink-0 opacity-0 transition group-hover:opacity-100",
                  active && "opacity-100"
                )}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-border/60 pt-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-panel text-sm font-semibold text-accent">
            {userId.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-foreground">NEXUS User</div>
            <div className="truncate text-xs text-muted-foreground">{userId}</div>
          </div>
          <Link
            href="/settings"
            onClick={onNavigate}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Open settings"
          >
            <Settings className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
