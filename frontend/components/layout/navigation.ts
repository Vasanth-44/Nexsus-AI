import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  FileText,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Map,
  Search,
  Settings
} from "lucide-react";

export const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Progress and recommendations",
    icon: LayoutDashboard
  },
  {
    href: "/assistant",
    label: "AI Assistant",
    description: "Career and learning agent",
    icon: Bot
  },
  {
    href: "/roadmap",
    label: "Roadmap",
    description: "Personalized career plans",
    icon: Map
  },
  {
    href: "/learning",
    label: "Learning",
    description: "Guided topic support",
    icon: GraduationCap
  },
  {
    href: "/career",
    label: "Career Analyzer",
    description: "Resume and role fit",
    icon: BriefcaseBusiness
  },
  {
    href: "/research",
    label: "Research",
    description: "AI and career research",
    icon: Search
  },
  {
    href: "/documents",
    label: "Documents",
    description: "RAG knowledge base",
    icon: FileText
  },
  {
    href: "/progress",
    label: "Progress",
    description: "Skill and project tracking",
    icon: BarChart3
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Profile and backend status",
    icon: Settings
  }
] as const;

export const productStats = [
  "Career guidance",
  "Learning memory",
  "RAG knowledge",
  "Progress tracking"
] as const;

export function getRouteLabel(pathname: string) {
  const item = navigationItems.find((entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`));
  return item?.label ?? "Dashboard";
}

export function getRouteDescription(pathname: string) {
  const item = navigationItems.find((entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`));
  return item?.description ?? "Progress and recommendations";
}
