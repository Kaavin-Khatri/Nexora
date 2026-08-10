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
  gapNarratives,
}: {
  matched: string[];
  missing: string[];
  totalRequired: number;
  gapNarratives?: Record<string, { why_it_matters: string; how_to_close: string }>;
}) {
  if (totalRequired === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This role doesn&apos;t list specific required skills.
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
        <div className="space-y-4">
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

          {gapNarratives && Object.keys(gapNarratives).length > 0 && (
            <div className="space-y-3 mt-4 border-l-2 pl-4 border-muted">
              {missing.map((s) => gapNarratives[s] && (
                <div key={`gap-${s}`} className="text-sm space-y-1">
                  <p className="font-medium text-foreground">{s}</p>
                  <p className="text-muted-foreground"><span className="font-medium text-foreground/80">Why it matters:</span> {gapNarratives[s].why_it_matters}</p>
                  <p className="text-muted-foreground"><span className="font-medium text-foreground/80">How to close:</span> {gapNarratives[s].how_to_close}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {totalRequired > 0 && missing.length === 0 && gapNarratives !== undefined && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
          <CheckCircle2 className="size-4" />
          <p>You cover every listed skill. Great match!</p>
        </div>
      )}
    </div>
  );
}
