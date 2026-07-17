import { PageHeader } from "@/components/layout/page-header";
import { JobFormCard } from "@/components/job-form";

export default function NewJobPage() {
  return (
    <>
      <PageHeader
        title="Post a job"
        description="Structured fields drive the filters — the description feeds the AI."
      />
      <JobFormCard mode="create" />
    </>
  );
}
