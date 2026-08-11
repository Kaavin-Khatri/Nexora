"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string; request_id?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const requestId = error.request_id || error.digest;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6 space-y-4">
      <div className="bg-destructive/10 p-4 rounded-full">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">Something went wrong</h2>
      <p className="text-muted-foreground text-center max-w-md">
        An unexpected error occurred. Our team has been notified.
      </p>
      {requestId && (
        <p className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded-md">
          Request ID: {requestId}
        </p>
      )}
      <Button onClick={reset} variant="default" className="mt-4">
        Try again
      </Button>
    </div>
  );
}
