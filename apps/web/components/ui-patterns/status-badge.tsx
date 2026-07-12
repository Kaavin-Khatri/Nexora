import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// THE single source of status color truth. No other file maps a status to a
// color — new statuses get added here and nowhere else.
export type Status =
  // application
  | "applied"
  | "screening"
  | "shortlisted"
  | "interview"
  | "rejected"
  | "hired"
  // job
  | "open"
  | "closed"
  // resume
  | "uploaded"
  | "parsing"
  | "parsed"
  | "failed";

const STATUS_STYLES: Record<Status, string> = {
  applied: "bg-surface-2 text-foreground border-border",
  screening: "bg-warning/15 text-warning border-warning/30",
  shortlisted: "bg-accent-2/15 text-accent-2 border-accent-2/30",
  interview: "bg-primary/15 text-primary border-primary/30",
  rejected: "bg-danger/15 text-danger border-danger/30",
  hired: "bg-success/15 text-success border-success/30",
  open: "bg-success/15 text-success border-success/30",
  closed: "bg-surface-2 text-muted-foreground border-border",
  uploaded: "bg-surface-2 text-foreground border-border",
  parsing: "bg-warning/15 text-warning border-warning/30",
  parsed: "bg-success/15 text-success border-success/30",
  failed: "bg-danger/15 text-danger border-danger/30",
};

export const ALL_STATUSES = Object.keys(STATUS_STYLES) as Status[];

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", STATUS_STYLES[status], className)}
    >
      {status}
    </Badge>
  );
}
