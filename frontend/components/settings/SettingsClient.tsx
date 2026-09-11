"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Monitor, Moon, RefreshCw, Settings, Sun, UserRound, WifiOff } from "lucide-react";
import { checkApiHealth } from "@/lib/api";
import type { ThemePreference } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useToast } from "@/components/ui/Toast";
import { useUserId } from "@/hooks/useUserId";
import { cn } from "@/lib/utils";

type ApiStatus = "checking" | "connected" | "offline";

const themeOptions: Array<{
  value: ThemePreference;
  label: string;
  icon: ReactNode;
}> = [
  { value: "dark", label: "Dark", icon: <Moon className="size-4" aria-hidden="true" /> },
  { value: "light", label: "Light", icon: <Sun className="size-4" aria-hidden="true" /> },
  { value: "system", label: "System", icon: <Monitor className="size-4" aria-hidden="true" /> }
];

export function SettingsClient() {
  const { userId, setUserId } = useUserId();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [draftUserId, setDraftUserId] = useState(userId);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const refreshStatus = async () => {
    setApiStatus("checking");

    try {
      await checkApiHealth();
      setApiStatus("connected");
    } catch {
      setApiStatus("offline");
    }
  };

  useEffect(() => {
    setDraftUserId(userId);
  }, [userId]);

  useEffect(() => {
    void refreshStatus();
  }, []);

  const saveProfile = () => {
    setUserId(draftUserId);
    showToast({
      title: "Profile updated",
      description: "NEXUS AI will use the new user ID for future requests.",
      type: "success"
    });
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="rounded-lg border border-border/70 bg-panel/[0.68] p-5 backdrop-blur-xl sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
            <Settings className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Settings</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Manage your local profile, backend connection, and workspace appearance.
            </p>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserRound className="size-5 text-accent" aria-hidden="true" />
              <h3 className="font-semibold text-foreground">Profile</h3>
            </div>
          </CardHeader>
          <CardBody>
            <label htmlFor="user-id" className="text-sm font-medium text-foreground">
              User ID
            </label>
            <input
              id="user-id"
              value={draftUserId}
              onChange={(event) => setDraftUserId(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-border bg-background/70 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button className="mt-4" onClick={saveProfile} disabled={!draftUserId.trim()}>
              Save User ID
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {apiStatus === "connected" ? (
                <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
              ) : apiStatus === "offline" ? (
                <WifiOff className="size-5 text-danger" aria-hidden="true" />
              ) : (
                <RefreshCw className="size-5 text-muted-foreground" aria-hidden="true" />
              )}
              <h3 className="font-semibold text-foreground">Backend</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="rounded-lg border border-border bg-muted/35 p-3">
              <p className="text-sm text-muted-foreground">API Status</p>
              <div className="mt-2 flex items-center gap-2">
                {apiStatus === "checking" ? (
                  <Spinner label="Checking" />
                ) : (
                  <span
                    className={cn(
                      "text-sm font-medium",
                      apiStatus === "connected" ? "text-success" : "text-danger"
                    )}
                  >
                    {apiStatus === "connected" ? "Connected" : "Offline"}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-3 break-all text-xs text-muted-foreground">{apiUrl}</p>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => void refreshStatus()}
              icon={<RefreshCw className="size-4" aria-hidden="true" />}
            >
              Refresh Status
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-foreground">Appearance</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Appearance theme">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={theme === option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex h-20 flex-col items-center justify-center gap-2 rounded-lg border text-sm transition",
                    theme === option.value
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-muted/35 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
