"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createId } from "@/lib/storage";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  type?: ToastType;
};

type ToastRecord = ToastInput & {
  id: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastIcons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="size-5 text-success" aria-hidden="true" />,
  error: <AlertCircle className="size-5 text-danger" aria-hidden="true" />,
  info: <Info className="size-5 text-accent" aria-hidden="true" />
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = createId("toast");
      const nextToast: ToastRecord = {
        id,
        type: toast.type ?? "info",
        title: toast.title,
        description: toast.description
      };

      setToasts((current) => [nextToast, ...current].slice(0, 4));
      window.setTimeout(() => removeToast(id), 4200);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "pointer-events-auto rounded-lg border border-border bg-panel/95 p-4 shadow-soft backdrop-blur-xl",
                toast.type === "error" && "border-danger/40"
              )}
            >
              <div className="flex gap-3">
                <div className="mt-0.5">{toastIcons[toast.type]}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p>
                  ) : null}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Dismiss notification"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}
