"use client";

import { Users } from "lucide-react";
import { DataTable, type Column } from "@/components/ui-patterns/data-table";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { Badge } from "@/components/ui/badge";

export type CandidateMatch = {
  user_id: string;
  full_name: string;
  years_experience: number | null;
  resume_id: string;
  skills: string[] | null;
  similarity: number;
};

const COLS: Column<CandidateMatch>[] = [
  {
    key: "name",
    header: "Candidate",
    cell: (m) => <span className="font-medium">{m.full_name}</span>,
    sortValue: (m) => m.full_name,
  },
  {
    key: "similarity",
    header: "Match",
    cell: (m) => (
      <span className="font-mono tabular-nums text-primary">
        {Math.round(m.similarity * 100)}%
      </span>
    ),
    sortValue: (m) => m.similarity,
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
];

export function MatchesTable({ matches }: { matches: CandidateMatch[] }) {
  return (
    <DataTable
      columns={COLS}
      data={matches}
      rowKey={(m) => m.user_id}
      empty={
        <EmptyState
          icon={Users}
          title="No matching candidates yet."
          sub="Candidates appear here once their profile and resume clear this job's filters."
        />
      }
    />
  );
}
