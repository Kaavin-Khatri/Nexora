"use client";

import { useState } from "react";
import { ChevronRight, Users } from "lucide-react";
import { DataTable, type Column } from "@/components/ui-patterns/data-table";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { MatchScoreCard } from "@/components/ui-patterns/match-score-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getMatchTier } from "@/lib/match-constants";
import type { MatchBreakdown } from "@/app/candidate/dashboard/dashboard-cards";

export type CandidateMatch = {
  user_id: string;
  full_name: string;
  years_experience: number | null;
  resume_id: string;
  skills: string[] | null;
  score: number;
  breakdown: MatchBreakdown;
};

const COLS: Column<CandidateMatch>[] = [
  {
    key: "name",
    header: "Candidate",
    cell: (m) => <span className="font-medium">{m.full_name}</span>,
    sortValue: (m) => m.full_name,
  },
  {
    key: "score",
    header: "Match",
    cell: (m) => {
      const tier = getMatchTier(m.score);
      return (
        <span className="flex items-center gap-2">
          <span className="font-mono tabular-nums text-primary">
            {Math.round(m.score * 100)}%
          </span>
          <span className={cn("text-xs", tier.className)}>{tier.label}</span>
        </span>
      );
    },
    sortValue: (m) => m.score,
  },
  {
    key: "experience",
    header: "Experience",
    cell: (m) =>
      m.years_experience !== null ? (
        `${m.years_experience} yrs`
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    sortValue: (m) => m.years_experience ?? 0,
  },
  {
    key: "skills",
    header: "Skills",
    cell: (m) => (
      <div className="flex flex-wrap gap-1">
        {(m.skills ?? []).slice(0, 4).map((s) => (
          <Badge key={s} variant="secondary" className="text-xs">
            {s}
          </Badge>
        ))}
        {(m.skills ?? []).length > 4 && (
          <span className="text-xs text-muted-foreground">
            +{(m.skills ?? []).length - 4}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "expand",
    header: "",
    cell: () => (
      <ChevronRight
        className="size-4 text-muted-foreground"
        aria-hidden
      />
    ),
  },
];

function MatchRow({
  match,
  isExpanded,
  onToggle,
}: {
  match: CandidateMatch;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/30"
        aria-expanded={isExpanded}
      >
        <span className="min-w-[10rem] font-medium">{match.full_name}</span>
        <span className="flex min-w-[6rem] items-center gap-2">
          <span className="font-mono tabular-nums text-primary">
            {Math.round(match.score * 100)}%
          </span>
          <span
            className={cn(
              "text-xs",
              getMatchTier(match.score).className,
            )}
          >
            {getMatchTier(match.score).label}
          </span>
        </span>
        <span className="min-w-[4rem] text-muted-foreground">
          {match.years_experience !== null
            ? `${match.years_experience} yrs`
            : "—"}
        </span>
        <span className="flex flex-1 flex-wrap gap-1">
          {(match.skills ?? []).slice(0, 4).map((s) => (
            <Badge key={s} variant="secondary" className="text-xs">
              {s}
            </Badge>
          ))}
          {(match.skills ?? []).length > 4 && (
            <span className="text-xs text-muted-foreground">
              +{(match.skills ?? []).length - 4}
            </span>
          )}
        </span>
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-90",
          )}
          aria-hidden
        />
      </button>
      {isExpanded && (
        <div className="bg-muted/20 px-4 pb-4 pt-2">
          <MatchScoreCard
            score={match.score}
            breakdown={match.breakdown}
            defaultExpanded
          />
        </div>
      )}
    </div>
  );
}

export function MatchesTable({ matches }: { matches: CandidateMatch[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (matches.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No matching candidates yet."
        sub="Candidates appear here once their profile and resume clear this job's filters."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Header row */}
      <div className="flex items-center gap-4 border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="min-w-[10rem]">Candidate</span>
        <span className="min-w-[6rem]">Match</span>
        <span className="min-w-[4rem]">Experience</span>
        <span className="flex-1">Skills</span>
        <span className="w-4" />
      </div>
      {/* Rows */}
      {matches.map((m) => (
        <MatchRow
          key={m.user_id}
          match={m}
          isExpanded={expandedId === m.user_id}
          onToggle={() =>
            setExpandedId((prev) =>
              prev === m.user_id ? null : m.user_id,
            )
          }
        />
      ))}
    </div>
  );
}
