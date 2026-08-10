import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import { api } from "@/lib/api-client";
import { AnalyticsDashboard, AnalyticsData } from "./analytics-dashboard";

export default async function RecruiterDashboard() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;

  const claims = await supabase.auth.getClaims();
  const name = claims.data?.claims?.user_metadata?.full_name ?? claims.data?.claims?.email ?? "there";

  const analytics = await api<AnalyticsData>("/companies/me/analytics", {
    headers: { Authorization: `Bearer ${data.session.access_token}` },
    cache: "no-store",
  }).catch(() => null);

  return (
    <>
      <PageHeader title="Dashboard" description={`Welcome back, ${name}`} />
      {analytics ? (
        <AnalyticsDashboard data={analytics} />
      ) : (
        <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground mt-4">
          <p>Failed to load analytics data or you haven&apos;t onboarded yet.</p>
        </div>
      )}
    </>
  );
}
