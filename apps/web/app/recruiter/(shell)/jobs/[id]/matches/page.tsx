import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { api } from "@/lib/api-client";
import type { Job } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { type CandidateMatch, MatchesTable } from "./matches-table";

export default async function JobMatchesPage({
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

  const matches = await api<CandidateMatch[]>(`/jobs/${id}/matches`, {
    headers,
    cache: "no-store",
  }).catch(() => []);

  return (
    <>
      <PageHeader
        title="Matches"
        description={`Candidates ranked by fit for “${job.title}”`}
      />
      <MatchesTable matches={matches} />
    </>
  );
}
