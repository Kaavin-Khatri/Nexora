import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";
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
import { JOB_TYPE_LABELS, type Job, type JobList } from "@/lib/jobs";
import { FilterBar } from "./filter-bar";

const PAGE_SIZE = 12;

function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/candidate/jobs/${job.id}`} className="group">
      <Card className="h-full transition-colors group-hover:border-primary/50">
        <CardHeader>
          <CardTitle className="text-base">{job.title}</CardTitle>
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

export default async function CandidateJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
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
