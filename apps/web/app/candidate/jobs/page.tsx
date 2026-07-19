import Link from "next/link";
import { Briefcase, MapPin, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/server";
import { JOB_TYPE_LABELS, type Job, type JobList } from "@/lib/jobs";
import {
  MatchBadge,
  type RecommendedJob,
} from "@/app/candidate/dashboard/dashboard-cards";
import { FilterBar } from "./filter-bar";

const PAGE_SIZE = 12;

function JobCard({ job, matchPct }: { job: Job; matchPct?: number }) {
  return (
    <Link href={`/candidate/jobs/${job.id}`} className="group">
      <Card className="h-full transition-colors group-hover:border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-start justify-between gap-2 text-base">
            <span>{job.title}</span>
            {matchPct !== undefined && <MatchBadge similarity={matchPct} />}
          </CardTitle>
          <CardDescription>
            {job.company?.name}
            {job.location && (
              <span className="ml-2 inline-flex items-center gap-1">
                <MapPin className="size-3" aria-hidden />
                {job.location}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-1.5 text-xs">
            {job.remote && <Badge variant="outline">Remote</Badge>}
            {job.job_type && (
              <Badge variant="outline">{JOB_TYPE_LABELS[job.job_type]}</Badge>
            )}
            {job.min_experience !== null && (
              <Badge variant="outline">{job.min_experience}+ yrs</Badge>
            )}
          </div>
          {job.required_skills && job.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.required_skills.slice(0, 5).map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
              {job.required_skills.length > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{job.required_skills.length - 5} more
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function Tabs({ active }: { active: "all" | "recommended" }) {
  const base = "rounded-md px-3 py-1.5 text-sm transition-colors";
  const on = "bg-primary text-primary-foreground";
  const off = "text-muted-foreground hover:bg-accent hover:text-foreground";
  return (
    <div className="mb-4 flex gap-1 rounded-lg border border-border p-1 w-fit">
      <Link
        href="/candidate/jobs"
        className={`${base} ${active === "all" ? on : off}`}
      >
        All jobs
      </Link>
      <Link
        href="/candidate/jobs?tab=recommended"
        className={`${base} ${active === "recommended" ? on : off}`}
      >
        <span className="inline-flex items-center gap-1">
          <Sparkles className="size-3.5" aria-hidden /> Recommended
        </span>
      </Link>
    </div>
  );
}

type Recommended = { items: RecommendedJob[]; missing: string[] };

async function RecommendedTab() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const rec = await api<Recommended>("/jobs/recommended", {
    headers: { Authorization: `Bearer ${session?.access_token}` },
    cache: "no-store",
  }).catch(() => null);

  if (!rec) {
    return (
      <p className="text-sm text-muted-foreground">
        Couldn’t load recommendations.
      </p>
    );
  }

  if (rec.missing.length > 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Complete your setup to get matches."
        sub={
          rec.missing.includes("profile") && rec.missing.includes("resume")
            ? "Fill in your profile (location, experience, job type) and upload a resume — matches need both."
            : rec.missing.includes("profile")
              ? "Fill in your profile — location, experience and desired job type drive the matching filters."
              : "Upload a resume — your matches are ranked by how well it fits each role."
        }
        action={
          <div className="flex gap-2">
            {rec.missing.includes("profile") && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/candidate/profile">Fill profile</Link>
              </Button>
            )}
            {rec.missing.includes("resume") && (
              <Button size="sm" asChild>
                <Link href="/candidate/resume">Upload resume</Link>
              </Button>
            )}
          </div>
        }
      />
    );
  }

  if (rec.items.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No matching jobs right now."
        sub="Your filters (job type, experience, location) didn’t match any open roles — check back soon."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rec.items.map((r) => (
        <JobCard
          key={r.id}
          matchPct={r.similarity}
          job={{
            id: r.id,
            title: r.title,
            description: "",
            location: r.location,
            remote: r.remote,
            job_type: r.job_type as Job["job_type"],
            min_experience: r.min_experience,
            required_skills: r.required_skills ?? [],
            status: "open",
            created_at: "",
            company: {
              id: "",
              name: r.company_name,
              website: null,
              size: null,
              about: null,
            },
          }}
        />
      ))}
    </div>
  );
}

export default async function CandidateJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  if (sp.tab === "recommended") {
    return (
      <>
        <PageHeader
          title="Jobs"
          description="Ranked by how well your resume fits each role."
        />
        <Tabs active="recommended" />
        <RecommendedTab />
      </>
    );
  }

  const qs = new URLSearchParams();
  if (sp.location) qs.set("location", sp.location);
  if (sp.job_type) qs.set("job_type", sp.job_type);
  if (sp.remote) qs.set("remote", sp.remote);
  const offset = Math.max(0, Number(sp.offset ?? 0) || 0);
  qs.set("limit", String(PAGE_SIZE));
  qs.set("offset", String(offset));

  const list = await api<JobList>(`/jobs?${qs.toString()}`, {
    cache: "no-store",
  }).catch(() => null);

  const pageLink = (newOffset: number) => {
    const next = new URLSearchParams(qs);
    next.set("offset", String(newOffset));
    return `/candidate/jobs?${next.toString()}`;
  };

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Open roles — filters narrow the list."
      />
      <Tabs active="all" />
      <FilterBar />
      {!list || list.items.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs match those filters."
          sub="Try widening your search — clear a filter or two."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          {list.total > PAGE_SIZE && (
            <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {offset + 1}–{Math.min(offset + PAGE_SIZE, list.total)} of{" "}
                {list.total}
              </span>
              <div className="flex gap-2">
                {offset > 0 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={pageLink(Math.max(0, offset - PAGE_SIZE))}>
                      Previous
                    </Link>
                  </Button>
                )}
                {offset + PAGE_SIZE < list.total && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={pageLink(offset + PAGE_SIZE)}>Next</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
