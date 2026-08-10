import { notFound } from "next/navigation";
import { Building2, MapPin, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { MatchScoreCard } from "@/components/ui-patterns/match-score-card";
import { SkillGapPanel } from "@/components/ui-patterns/skill-gap-panel";
import { ApplyButton } from "./apply-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { JOB_TYPE_LABELS, type Job } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import type {
  MatchBreakdown,
  RecommendedJob,
} from "@/app/candidate/dashboard/dashboard-cards";

type Recommended = { items: RecommendedJob[]; missing: string[] };

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await api<Job>(`/jobs/${id}`, { cache: "no-store" }).catch(
    () => null,
  );
  if (!job) notFound();

  // Try to load the candidate's match for this job (fails silently for
  // logged-out visitors or non-candidates — the fit section just hides).
  let matchData: { score: number; breakdown: MatchBreakdown } | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      const rec = await api<Recommended>("/jobs/recommended", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const found = rec.items.find((r) => r.id === id);
      if (found) {
        matchData = { score: found.score, breakdown: found.breakdown };
      }
    }
  } catch {
    // Not logged in or not a candidate — no fit section shown
  }

  let hasApplied = false;
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      const apps = await api<any[]>("/applications/me", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      hasApplied = apps.some((a) => a.job.id === id);
    }
  } catch {
    // ignore
  }

  return (
    <>
      <PageHeader
        title={job.title}
        description={job.company?.name}
        action={<ApplyButton jobId={job.id} initialApplied={hasApplied} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Your fit — only when the candidate has a match */}
          {matchData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles
                    className="size-4 text-muted-foreground"
                    aria-hidden
                  />
                  Your fit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MatchScoreCard
                  score={matchData.score}
                  breakdown={matchData.breakdown}
                  defaultExpanded
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">About this role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {job.remote && <Badge variant="outline">Remote</Badge>}
                {job.job_type && (
                  <Badge variant="outline">
                    {JOB_TYPE_LABELS[job.job_type]}
                  </Badge>
                )}
                {job.min_experience !== null && (
                  <Badge variant="outline">{job.min_experience}+ years</Badge>
                )}
                {job.location && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="size-3" aria-hidden />
                    {job.location}
                  </Badge>
                )}
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {job.required_skills && job.required_skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Required skills</CardTitle>
              </CardHeader>
              <CardContent>
                {matchData ? (
                  <SkillGapPanel
                    matched={matchData.breakdown.matched}
                    missing={matchData.breakdown.missing}
                    totalRequired={
                      matchData.breakdown.matched.length +
                      matchData.breakdown.missing.length
                    }
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2
                className="size-4 text-muted-foreground"
                aria-hidden
              />
              {job.company?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {job.company?.size && <p>{job.company.size} people</p>}
            {job.company?.website && (
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-primary hover:underline"
              >
                {job.company.website}
              </a>
            )}
            {job.company?.about && <p>{job.company.about}</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
