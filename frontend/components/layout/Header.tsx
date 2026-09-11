"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getRouteDescription, getRouteLabel } from "@/components/layout/navigation";
import { useUserId } from "@/hooks/useUserId";

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { userId } = useUserId();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/78 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="size-10 p-0 lg:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{getRouteLabel(pathname)}</h1>
            <p className="hidden truncate text-sm text-muted-foreground sm:block">{getRouteDescription(pathname)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-border/70 bg-panel/[0.72] px-3 py-2 text-sm text-muted-foreground md:flex">
            <UserRound className="size-4 text-accent" aria-hidden="true" />
            <span className="max-w-36 truncate">{userId}</span>
          </div>
          <Link
            href="/settings"
            className="grid size-10 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="size-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
