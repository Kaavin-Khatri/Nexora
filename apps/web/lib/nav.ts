import {
  Briefcase,
  Building2,
  FileText,
  LayoutDashboard,
  Send,
  User,
  type LucideIcon,
} from "lucide-react";

// role -> sidebar items. Consumed by the app shell.
export type Role = "candidate" | "recruiter";

export type NavItem = { label: string; href: string; icon: LucideIcon };

export const NAV: Record<Role, NavItem[]> = {
  candidate: [
    { label: "Dashboard", href: "/candidate/dashboard", icon: LayoutDashboard },
    { label: "Jobs", href: "/candidate/jobs", icon: Briefcase },
    { label: "Resume", href: "/candidate/resume", icon: FileText },
    { label: "Applications", href: "/candidate/applications", icon: Send },
    { label: "Profile", href: "/candidate/profile", icon: User },
  ],
  recruiter: [
    { label: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
    { label: "Jobs", href: "/recruiter/jobs", icon: Briefcase },
    { label: "Company", href: "/recruiter/company", icon: Building2 },
  ],
};
