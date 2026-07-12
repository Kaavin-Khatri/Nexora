// role -> sidebar items. Consumed by the Phase 4 app shell.
export type Role = "candidate" | "recruiter";

export type NavItem = { label: string; href: string };

export const NAV: Record<Role, NavItem[]> = {
  candidate: [
    { label: "Dashboard", href: "/candidate/dashboard" },
    { label: "Jobs", href: "/candidate/jobs" },
    { label: "Resume", href: "/candidate/resume" },
    { label: "Applications", href: "/candidate/applications" },
    { label: "Profile", href: "/candidate/profile" },
  ],
  recruiter: [
    { label: "Dashboard", href: "/recruiter/dashboard" },
    { label: "Jobs", href: "/recruiter/jobs" },
    { label: "Company", href: "/recruiter/company" },
  ],
};
