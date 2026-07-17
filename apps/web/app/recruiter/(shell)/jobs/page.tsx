import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import type { Job } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { JobsTable } from "./jobs-table";

export default async function RecruiterJobsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const jobs = await api<Job[]>("/jobs/mine", {
    headers: { Authorization: `Bearer ${session?.access_token}` },
    cache: "no-store",
  }).catch(() => []);

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Your postings — open jobs are visible to candidates."
        action={
          <Button asChild>
            <Link href="/recruiter/jobs/new">Post a job</Link>
          </Button>
        }
      />
      <JobsTable jobs={jobs} />
    </>
  );
}
