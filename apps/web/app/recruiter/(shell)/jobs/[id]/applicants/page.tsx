import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { api } from "@/lib/api-client";
import type { Job } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { ApplicantsTable, type Applicant } from "./applicants-table";

export default async function JobApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers = { Authorization: `Bearer ${session?.access_token}` };

  const jobs = await api<Job[]>("/jobs/mine", {
    headers,
    cache: "no-store",
  }).catch(() => []);
  const job = jobs.find((j) => j.id === id);
  if (!job) notFound();

  const applicants = await api<Applicant[]>(`/jobs/${id}/applications`, {
    headers,
    cache: "no-store",
  }).catch(() => []);

  return (
    <>
      <PageHeader
        title="Applicants"
        description={`Candidates who applied for “${job.title}”`}
      />
      <ApplicantsTable applicants={applicants} />
    </>
  );
}
