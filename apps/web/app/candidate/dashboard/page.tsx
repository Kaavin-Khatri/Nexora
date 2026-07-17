import { PageHeader } from "@/components/layout/page-header";
import { api } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/server";
import {
  CompletenessCard,
  NewAccountFunnel,
  type Overview,
  ScoreCard,
  SkillsCard,
} from "./dashboard-cards";

export default async function CandidateDashboard() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const name =
    session?.user.user_metadata?.full_name ?? session?.user.email ?? "there";

  // ONE round trip — every dashboard card reads from this payload.
  const overview = await api<Overview>("/candidates/me/overview", {
    headers: { Authorization: `Bearer ${session?.access_token}` },
    cache: "no-store",
  }).catch(() => null);

  return (
    <>
      <PageHeader title="Dashboard" description={`Welcome back, ${name}`} />

      {!overview ? (
        <p className="text-sm text-muted-foreground">
          Couldn’t load your dashboard — is the API running? Refresh to retry.
        </p>
      ) : !overview.completeness.resume_uploaded ? (
        <div className="max-w-2xl">
          <NewAccountFunnel
            profileComplete={overview.completeness.profile_complete}
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {overview.ats_score !== null && (
            <ScoreCard
              score={overview.ats_score}
              improvements={overview.improvements}
            />
          )}
          <div className="space-y-4">
            <CompletenessCard completeness={overview.completeness} />
            <SkillsCard skills={overview.skills} />
          </div>
        </div>
      )}
    </>
  );
}
