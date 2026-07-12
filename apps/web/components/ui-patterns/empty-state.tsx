import type { LucideIcon } from "lucide-react";

// Product-voice empty states: say what to DO next, never "No data found".
export function EmptyState({
  icon: Icon,
  title,
  sub,
  action,
}: {
  icon: LucideIcon;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
      <Icon className="size-8 text-muted-foreground" aria-hidden />
      <p className="font-medium">{title}</p>
      {sub && <p className="max-w-sm text-sm text-muted-foreground">{sub}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
