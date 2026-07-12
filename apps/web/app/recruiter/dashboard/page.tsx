// Placeholder — replaced by the real recruiter dashboard in a later phase.
import { createClient } from "@/lib/supabase/server";

export default async function RecruiterDashboard() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const name = claims?.user_metadata?.full_name ?? claims?.email ?? "there";

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Recruiter dashboard</h1>
      <p className="mt-2 text-sm">
        Hello {name} — role: {claims?.user_metadata?.role ?? "recruiter"}
      </p>
    </main>
  );
}
