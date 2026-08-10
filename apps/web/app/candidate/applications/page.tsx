import Link from "next/link";
import { Briefcase, Building2, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { MatchScoreCard } from "@/components/ui-patterns/match-score-card";
import { StatusBadge } from "@/components/ui-patterns/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/server";
import { InterviewQuestions } from "@/app/recruiter/(shell)/jobs/[id]/applicants/interview-questions";

export default async function CandidateApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const apps = await api<any[]>("/applications/me", {
    headers: { Authorization: `Bearer ${session?.access_token}` },
    cache: "no-store",
  }).catch(() => []);

  if (apps.length === 0) {
    return (
      <>
        <PageHeader title="Applications" />
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          sub="When you apply to jobs, you'll be able to track their status here."
          action={
            <Link
              href="/candidate/jobs"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Browse jobs
            </Link>
          }
        />
      </>
    );
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <PageHeader title="Applications" />
      <div className="grid gap-4">
        {apps.map((app) => (
          <Card key={app.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <Link
                  href={`/candidate/jobs/${app.job.id}`}
                  className="font-semibold text-lg hover:underline"
                >
                  {app.job.title}
                </Link>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Building2 className="size-4" />
                    {app.job.company.name}
                  </span>
                  {app.job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {app.job.location}
                    </span>
                  )}
                  {app.job.remote && (
                    <Badge variant="secondary" className="px-1.5 py-0">
                      Remote
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={app.status} />
                <span className="text-xs text-muted-foreground">
                  Applied {dateFormatter.format(new Date(app.applied_at))}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {app.match_score !== null && app.match_breakdown && (
                <div className="mt-2 max-w-2xl">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                    Application Snapshot
                  </p>
                  <MatchScoreCard
                    score={app.match_score}
                    breakdown={app.match_breakdown}
                  />
                </div>
              )}
              
              <div className="mt-6 border-t pt-4 max-w-2xl">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  Interview Prep
                </p>
                <InterviewQuestions applicationId={app.id} isCandidate />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
