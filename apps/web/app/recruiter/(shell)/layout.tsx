import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/server";

// Every shell page requires a company. A recruiter without one is sent to
// onboarding (which lives OUTSIDE this route group to avoid a redirect loop).
export default async function RecruiterShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const company = await api("/companies/me", {
    headers: { Authorization: `Bearer ${session?.access_token}` },
    cache: "no-store",
  }).catch(() => null);

  if (!company) redirect("/recruiter/onboarding");

  return (
    <AppShell
      role="recruiter"
      name={session?.user.user_metadata?.full_name ?? null}
      email={session?.user.email ?? null}
    >
      {children}
    </AppShell>
  );
}
