"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { DataTable, type Column } from "@/components/ui-patterns/data-table";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { StatusBadge, type Status } from "@/components/ui-patterns/status-badge";
import { Badge } from "@/components/ui/badge";
import type { MatchBreakdown } from "@/components/ui-patterns/match-score-card";
import { ApplicantDetailDrawer } from "./applicant-detail-drawer";
import { getMatchTier } from "@/lib/match-constants";

export type Applicant = {
  id: string;
  candidate_id: string;
  candidate: {
    full_name: string;
    headline: string | null;
    location: string | null;
    years_experience: number | null;
  };
  resume: {
    skills: string[];
    parsed_json: any;
  };
  status: string;
  match_score: number | null;
  match_breakdown: MatchBreakdown | null;
  applied_at: string;
};

const COLS: Column<Applicant>[] = [
  {
    key: "name",
    header: "Candidate",
    cell: (a) => (
      <div>
        <div className="font-medium text-foreground">{a.candidate.full_name}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
          {a.candidate.headline || "No headline"}
        </div>
      </div>
    ),
    sortValue: (a) => a.candidate.full_name,
  },
  {
    key: "score",
    header: "Match Score",
    cell: (a) => {
      if (a.match_score === null) return <span className="text-muted-foreground">—</span>;
      const pct = Math.round(a.match_score * 100);
      const tier = getMatchTier(a.match_score);
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono font-medium">{pct}%</span>
          <span className="text-xs text-muted-foreground">{tier.label}</span>
        </div>
      );
    },
    sortValue: (a) => a.match_score ?? 0,
  },
  {
    key: "skills",
    header: "Top Skills",
    cell: (a) => (
      <div className="flex flex-wrap gap-1">
        {a.resume.skills?.slice(0, 3).map((s) => (
          <Badge key={s} variant="secondary" className="px-1.5 py-0 font-normal">
            {s}
          </Badge>
        ))}
        {a.resume.skills?.length > 3 && (
          <span className="text-xs text-muted-foreground ml-1">+{a.resume.skills.length - 3}</span>
        )}
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (a) => <StatusBadge status={a.status as Status} />,
    sortValue: (a) => a.status,
  },
  {
    key: "applied",
    header: "Applied",
    cell: (a) => new Date(a.applied_at).toLocaleDateString(),
    sortValue: (a) => a.applied_at,
  },
];

export function ApplicantsTable({ applicants }: { applicants: Applicant[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedApplicant = applicants.find((a) => a.id === selectedId) ?? null;

  return (
    <>
      <DataTable
        columns={COLS}
        data={applicants}
        rowKey={(a) => a.id}
        onRowClick={(a) => setSelectedId(a.id)}
        empty={
          <EmptyState
            icon={Users}
            title="No applicants yet."
            sub="Candidates who apply to this job will appear here."
          />
        }
      />

      <ApplicantDetailDrawer
        applicant={selectedApplicant}
        open={!!selectedApplicant}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </>
  );
}
