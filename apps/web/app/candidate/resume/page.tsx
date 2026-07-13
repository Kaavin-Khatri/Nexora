import { PageHeader } from "@/components/layout/page-header";
import { api } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/server";
import type { ResumeStatus } from "@/lib/upload-resume";
import { ResumeUpload } from "./resume-upload";

export default async function CandidateResumePage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // /resumes/latest returns the row or null.
  const latest = await api<ResumeStatus | null>("/resumes/latest", {
    headers: { Authorization: `Bearer ${session?.access_token}` },
    cache: "no-store",
  }).catch(() => null);

  return (
    <>
      <PageHeader
        title="Resume"
        description="Upload your resume — we read it to score your fit and match you to jobs."
      />
      <ResumeUpload initial={latest} />
    </>
  );
}
