/**
 * SkillGapPanel — reusable matched/missing skill chip display.
 *
 * Renders from the stored breakdown only (no client-side recomputation).
 * Used by MatchScoreCard (expanded view) and candidate job detail ("Your fit").
 */

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleAlert } from "lucide-react";

export function SkillGapPanel({
  matched,
  missing,
  totalRequired,
}: {
  matched: string[];
  missing: string[];
  totalRequired: number;
}) {
  if (totalRequired === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This role doesn't list specific required skills.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm">
        You match{" "}
        <span className="font-mono tabular-nums font-medium text-primary">
          {matched.length}
        </span>{" "}
        of{" "}
        <span className="font-mono tabular-nums font-medium">
          {totalRequired}
        </span>{" "}
        required skills
        {missing.length > 0 && (
          <>
            {" "}
            — missing:{" "}
            <span className="text-muted-foreground">
              {missing.join(", ")}
            </span>
          </>
        )}
      </p>

      {matched.length > 0 && (
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <CheckCircle2 className="size-3 text-success" aria-hidden />
            Matched
          </p>
          <div className="flex flex-wrap gap-1.5">
            {matched.map((s) => (
              <Badge
                key={s}
                className="border-primary/30 bg-primary/15 text-primary"
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <CircleAlert className="size-3 text-destructive" aria-hidden />
            Missing
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="border-destructive/30 text-muted-foreground"
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
