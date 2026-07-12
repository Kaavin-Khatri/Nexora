import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  return (
    <AppShell
      role="recruiter"
      name={claims?.user_metadata?.full_name ?? null}
      email={claims?.email ?? null}
    >
      {children}
    </AppShell>
  );
}
