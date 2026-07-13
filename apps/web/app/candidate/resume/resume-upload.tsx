"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, UploadCloud, XCircle } from "lucide-react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui-patterns/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getAccessToken,
  getResumeStatus,
  type ResumeStatus,
  uploadResume,
} from "@/lib/upload-resume";

const ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};
const MAX_SIZE = 5 * 1024 * 1024;
const POLL_MS = 2000;
// If parsing never resolves (e.g. the API was killed mid-parse and the
// in-process task died with it), trip to a retry state instead of polling
// forever. 30s is generous for the real pipeline (5.3).
const MAX_POLLS = 15;

type Phase = "idle" | "uploading" | "processing" | "done" | "error";

export function ResumeUpload({ initial }: { initial: ResumeStatus | null }) {
  const [phase, setPhase] = useState<Phase>(
    initial?.status === "parsed"
      ? "done"
      : initial?.status === "failed"
        ? "error"
        : initial?.status === "parsing" || initial?.status === "uploaded"
          ? "processing"
          : "idle",
  );
  const [progress, setProgress] = useState(0);
  const [resume, setResume] = useState<ResumeStatus | null>(initial);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    initial?.error_message ?? null,
  );
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  }, []);

  const poll = useCallback(
    (id: string) => {
      stopPolling();
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts += 1;
        try {
          const token = await getAccessToken();
          const r = await getResumeStatus(id, token);
          setResume(r);
          if (r.status === "parsed") {
            stopPolling();
            setPhase("done");
            return;
          } else if (r.status === "failed") {
            stopPolling();
            setErrorMsg(r.error_message ?? "Parsing failed");
            setPhase("error");
            return;
          }
        } catch {
          // transient (e.g. API restarting) — keep polling until the cap
        }
        if (attempts >= MAX_POLLS) {
          stopPolling();
          setErrorMsg(
            "Processing is taking longer than expected. Please try again.",
          );
          setPhase("error");
        }
      }, POLL_MS);
    },
    [stopPolling],
  );

  // Resume polling if we loaded mid-flight; clean up on unmount.
  useEffect(() => {
    if ((phase === "processing" || phase === "uploading") && resume?.id)
      poll(resume.id);
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDrop = useCallback(
    async (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length) {
        const code = rejections[0].errors[0]?.code;
        toast.error(
          code === "file-too-large"
            ? "That file is over the 5MB limit."
            : code === "file-invalid-type"
              ? "Only PDF or DOCX files are accepted."
              : "That file was rejected.",
        );
        return;
      }
      const file = accepted[0];
      if (!file) return;
      setPhase("uploading");
      setProgress(0);
      setErrorMsg(null);
      try {
        const token = await getAccessToken();
        const created = await uploadResume(file, token, setProgress);
        setResume(created);
        setPhase("processing");
        poll(created.id);
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Upload failed");
        setPhase("error");
      }
    },
    [poll],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    multiple: false,
    disabled: phase === "uploading" || phase === "processing",
  });

  const reset = () => {
    stopPolling();
    setPhase("idle");
    setProgress(0);
    setErrorMsg(null);
  };

  return (
    <Card className="max-w-xl">
      <CardContent className="space-y-4">
        {(phase === "idle" || phase === "done" || phase === "error") && (
          <div
            {...getRootProps()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12 text-center transition-colors hover:border-primary/50",
              isDragActive && "border-primary bg-primary/5",
            )}
          >
            <input {...getInputProps()} />
            <UploadCloud className="size-8 text-muted-foreground" aria-hidden />
            <p className="font-medium">
              {isDragActive
                ? "Drop your resume here"
                : "Drag your resume here, or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground">
              PDF or DOCX, up to 5MB
            </p>
          </div>
        )}

        {phase === "uploading" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <UploadCloud className="size-4 text-primary" aria-hidden />
              Uploading… {progress}%
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {phase === "processing" && (
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <FileText
              className="size-5 animate-pulse text-primary"
              aria-hidden
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Reading your resume…</p>
              <p className="text-xs text-muted-foreground">
                This usually takes a few seconds.
              </p>
            </div>
            {resume && <StatusBadge status={resume.status} />}
          </div>
        )}

        {phase === "done" && (
          <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-4">
            <CheckCircle2 className="size-5 text-success" aria-hidden />
            <p className="flex-1 text-sm font-medium">
              Resume uploaded and read.
            </p>
            <StatusBadge status="parsed" />
          </div>
        )}

        {phase === "error" && (
          <div className="flex items-center gap-3 rounded-lg border border-danger/30 bg-danger/5 p-4">
            <XCircle className="size-5 text-danger" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-medium">Something went wrong.</p>
              <p className="text-xs text-muted-foreground">{errorMsg}</p>
            </div>
            <Button size="sm" variant="outline" onClick={reset}>
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
