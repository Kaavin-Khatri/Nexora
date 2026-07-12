import type { Role } from "@/lib/nav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

// The persistent frame both roles live inside. min-w-0 on the content column
// keeps wide children (tables) from forcing horizontal scroll.
export function AppShell({
  role,
  name,
  email,
  children,
}: {
  role: Role;
  name: string | null;
  email: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={role} name={name} email={email} />
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
