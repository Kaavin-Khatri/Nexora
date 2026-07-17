import { notFound } from "next/navigation";
import { Building2, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { JOB_TYPE_LABELS, type Job } from "@/lib/jobs";

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

  return (
    <>
      <PageHeader
        title={job.title}
        description={job.company?.name}
        action={
          // Placeholder — applications land in Phase 9.
          <Button disabled title="Applications open soon">
            Apply
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
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
              <CardContent className="flex flex-wrap gap-2">
                {job.required_skills.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-muted-foreground" aria-hidden />
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
