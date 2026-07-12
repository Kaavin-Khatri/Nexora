// Placeholder content — real recruiter dashboard arrives in a later phase.
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function RecruiterDashboard() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const name = claims?.user_metadata?.full_name ?? claims?.email ?? "there";

  return (
    <>
      <PageHeader title="Dashboard" description={`Welcome back, ${name}`} />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Get started</CardTitle>
          <CardDescription>
            Set up your company profile and post your first job to start
            receiving ranked, explainable candidate matches.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Job posting lands in a coming phase — your dashboard will fill in as
          features ship.
        </CardContent>
      </Card>
    </>
  );
}
