import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { JobFormCard } from "@/components/job-form";
import { api } from "@/lib/api-client";
import type { Job } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // /jobs/mine (not /jobs/{id}) so closed jobs stay editable by their owner.
  const jobs = await api<Job[]>("/jobs/mine", {
    headers: { Authorization: `Bearer ${session?.access_token}` },
    cache: "no-store",
  }).catch(() => []);
  const job = jobs.find((j) => j.id === id);
  if (!job) notFound();

  return (
    <>
      <PageHeader title="Edit job" description={job.title} />
      <JobFormCard mode="edit" initial={job} />
    </>
  );
}
