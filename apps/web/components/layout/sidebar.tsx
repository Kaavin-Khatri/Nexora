"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, type Role } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Logo() {
  return (
    <Link
      href="/"
      className="px-6 font-heading text-lg font-bold tracking-tight"
    >
      Nex<span className="text-primary">ora</span>
    </Link>
  );
}

export function NavLinks({
  role,
  onNavigate,
}: {
  role: Role;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV[role].map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar py-5 lg:flex">
      <Logo />
      <NavLinks role={role} />
    </aside>
  );
}
