// Placeholder content — real candidate dashboard arrives in a later phase.
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function CandidateDashboard() {
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
            Upload your resume to unlock ATS scoring and job matches built for
            your skills.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Resume upload lands in the next phase — your dashboard will fill in as
          features ship.
        </CardContent>
      </Card>
    </>
  );
}
