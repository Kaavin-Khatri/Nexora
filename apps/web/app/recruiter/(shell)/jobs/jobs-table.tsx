"use client";

import Link from "next/link";
import { Briefcase, Pencil, Users } from "lucide-react";
import { DataTable, type Column } from "@/components/ui-patterns/data-table";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import {
  StatusBadge,
  type Status,
} from "@/components/ui-patterns/status-badge";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/jobs";

const COLS: Column<Job>[] = [
  {
    key: "title",
    header: "Title",
    cell: (j) => <span className="font-medium">{j.title}</span>,
    sortValue: (j) => j.title,
  },
  {
    key: "status",
    header: "Status",
    cell: (j) => <StatusBadge status={j.status as Status} />,
    sortValue: (j) => j.status,
  },
  {
    key: "created",
    header: "Posted",
    cell: (j) => new Date(j.created_at).toLocaleDateString(),
    sortValue: (j) => j.created_at,
  },
  {
    key: "applicants",
    header: "Applicants",
    // placeholder — real counts land with applications (Phase 9)
    cell: () => <span className="text-muted-foreground">—</span>,
  },
  {
    key: "actions",
    header: "",
    cell: (j) => (
      <span className="inline-flex items-center gap-3">
        <Link
          href={`/recruiter/jobs/${j.id}/matches`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Users className="size-3.5" aria-hidden /> Matches
        </Link>
        <Link
          href={`/recruiter/jobs/${j.id}/edit`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Pencil className="size-3.5" aria-hidden /> Edit
        </Link>
      </span>
    ),
    className: "text-right",
  },
];

export function JobsTable({ jobs }: { jobs: Job[] }) {
  return (
    <DataTable
      columns={COLS}
      data={jobs}
      rowKey={(j) => j.id}
      empty={
        <EmptyState
          icon={Briefcase}
          title="No jobs yet."
          sub="Post your first job to start receiving ranked candidate matches."
          action={
            <Button size="sm" asChild>
              <Link href="/recruiter/jobs/new">Post a job</Link>
            </Button>
          }
        />
      }
    />
  );
}
