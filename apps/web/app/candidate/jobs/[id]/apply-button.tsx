"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export function ApplyButton({
  jobId,
  initialApplied,
}: {
  jobId: string;
  initialApplied: boolean;
}) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(initialApplied);
  const router = useRouter();

  if (applied) {
    return (
      <Button variant="outline" asChild>
        <Link href="/candidate/applications">
          <CheckCircle2 className="mr-2 size-4 text-success" aria-hidden />
          Applied
        </Link>
      </Button>
    );
  }

  const handleApply = async () => {
    setApplying(true);
    try {
      await api("/applications", {
        method: "POST",
        body: JSON.stringify({ job_id: jobId }),
      });
      setApplied(true);
      toast.success("Application submitted successfully!");
      router.refresh();
    } catch (err: any) {
      if (err.status === 422) {
        toast.error(err.message || "A parsed resume is required to apply.");
        router.push("/candidate/resume");
      } else if (err.status === 409) {
        toast.error("You have already applied to this job.");
        setApplied(true);
      } else {
        toast.error(err.message || "Something went wrong.");
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <Button onClick={handleApply} disabled={applying}>
      {applying && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
      Apply now
    </Button>
  );
}
