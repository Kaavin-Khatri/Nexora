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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";

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
  const [localApplicants, setLocalApplicants] = useState(applicants);

  const selectedApplicant = localApplicants.find((a) => a.id === selectedId) ?? null;

  async function updateStatus(appId: string, newStatus: string) {
    const original = [...localApplicants];
    
    // Optimistic update
    setLocalApplicants((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      await api(`/applications/${appId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (e: any) {
      setLocalApplicants(original);
      toast.error(e.message || "Failed to update status");
    }
  }

  const columnsWithActions = [
    ...COLS,
    {
      key: "actions",
      header: "",
      cell: (a: Applicant) => {
        const canShortlist = ["applied", "screening"].includes(a.status);
        const canReject = !["rejected", "hired"].includes(a.status);
        if (!canShortlist && !canReject) return null;

        return (
          <div
            className="flex items-center gap-2 justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            {canShortlist && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateStatus(a.id, "shortlisted")}
              >
                Shortlist
              </Button>
            )}
            {canReject && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-danger"
                onClick={() => updateStatus(a.id, "rejected")}
              >
                Reject
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columnsWithActions}
        data={localApplicants}
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
        onUpdateStatus={updateStatus}
      />
    </>
  );
}
