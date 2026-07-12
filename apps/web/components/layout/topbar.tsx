"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Role } from "@/lib/nav";
import { Logo, NavLinks } from "./sidebar";

export function Topbar({
  role,
  name,
  email,
}: {
  role: Role;
  name: string | null;
  email: string | null;
}) {
  const [open, setOpen] = useState(false);
  const initials = (name ?? email ?? "?").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex w-64 flex-col gap-6 bg-sidebar p-0 py-5"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <Logo />
          <NavLinks role={role} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="User menu"
            className="rounded-full outline-ring/50"
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <div className="truncate px-2 py-1.5 text-xs text-muted-foreground">
            {email}
          </div>
          <DropdownMenuItem asChild>
            <Link href={`/${role}/profile`}>Profile</Link>
          </DropdownMenuItem>
          <form action="/logout" method="post">
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full">
                Log out
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
