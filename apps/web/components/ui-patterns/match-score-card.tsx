/**
 * MatchScoreCard — expandable match score display with explainable breakdown.
 *
 * Shows: mono % + tier label. Expands to: three labeled bars (Semantic fit,
 * Skills overlap, Experience fit) each showing its weight, then matched vs
 * missing skill chips via SkillGapPanel.
 *
 * Rule: renders ONLY the stored breakdown — zero client-side recomputation.
 */

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMatchTier,
  SCORE_COMPONENTS,
  type ScoreComponent,
} from "@/lib/match-constants";
import { SkillGapPanel } from "./skill-gap-panel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MatchBreakdown } from "@/app/candidate/dashboard/dashboard-cards";
export type { MatchBreakdown };

// ---------------------------------------------------------------------------
// Component bar — one row in the expanded breakdown
// ---------------------------------------------------------------------------

function ComponentBar({
  component,
  value,
  weight,
}: {
  component: ScoreComponent;
  value: number | null;
  weight: number;
}) {
  // null value means "not applicable" (e.g. skill_overlap with no required skills)
  const pct = value !== null ? Math.round(value * 100) : null;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help border-b border-dashed border-muted-foreground/40 text-muted-foreground">
                {component.label}
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-64 text-xs leading-relaxed"
            >
              {component.tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            ×{Math.round(weight * 100)}%
          </span>
          <span className="min-w-[3ch] text-right font-mono tabular-nums font-medium">
            {pct !== null ? `${pct}%` : "—"}
          </span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-300", component.colorClass)}
          style={{ width: `${pct ?? 0}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MatchScoreCard (main export)
// ---------------------------------------------------------------------------

export function MatchScoreCard({
  score,
  breakdown,
  defaultExpanded = false,
}: {
  score: number;
  breakdown: MatchBreakdown;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const tier = getMatchTier(score);
  const pct = Math.round(score * 100);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Collapsed header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl font-semibold tabular-nums text-primary">
            {pct}%
          </span>
          <span className={cn("text-sm font-medium", tier.className)}>
            {tier.label}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {/* Expanded breakdown — renders stored values only */}
      {expanded && (
        <div className="space-y-4 border-t border-border px-4 py-4">
          {/* Three component bars */}
          <div className="space-y-3">
            {SCORE_COMPONENTS.map((comp) => (
              <ComponentBar
                key={comp.key}
                component={comp}
                value={
                  breakdown[comp.key] as number | null
                }
                weight={breakdown.weights[comp.weightKey] ?? 0}
              />
            ))}
          </div>

          {/* Redistribution note */}
          {breakdown.note && (
            <p className="text-xs italic text-muted-foreground">
              {breakdown.note}
            </p>
          )}

          {/* Skill gap chips */}
          <div className="border-t border-border pt-4">
            <SkillGapPanel
              matched={breakdown.matched}
              missing={breakdown.missing}
              totalRequired={breakdown.matched.length + breakdown.missing.length}
            />
          </div>
        </div>
      )}
    </div>
  );
}
