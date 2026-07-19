// Server-rendered dashboard cards — no client interactivity beyond links.
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FileText,
  Gauge,
  Sparkles,
  Wrench,
} from "lucide-react";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type RecommendedJob = {
  id: string;
  title: string;
  company_name: string;
  location: string | null;
  remote: boolean;
  job_type: string | null;
  min_experience: number | null;
  required_skills: string[] | null;
  similarity: number;
};

export type Overview = {
  profile: {
    full_name: string;
    headline: string | null;
    location: string | null;
    years_experience: number | null;
    desired_job_type: string | null;
    open_to_remote: boolean;
  };
  resume_status: string | null;
  ats_score: number | null;
  improvements: { name: string; score: number; max: number; detail: string }[];
  skills: string[];
  completeness: {
    profile_complete: boolean;
    resume_uploaded: boolean;
    resume_parsed: boolean;
  };
  recommended: RecommendedJob[];
};

export function MatchBadge({ similarity }: { similarity: number }) {
  return (
    <Badge className="bg-primary/15 font-mono tabular-nums text-primary border-primary/30">
      {Math.round(similarity * 100)}% match
    </Badge>
  );
}

export function RecommendedCard({ jobs }: { jobs: RecommendedJob[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-muted-foreground" aria-hidden />
          Recommended for you
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2.5">
          {jobs.map((j) => (
            <li key={j.id}>
              <Link
                href={`/candidate/jobs/${j.id}`}
                className="flex items-center justify-between gap-3 rounded-md border border-border p-3 transition-colors hover:border-primary/50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {j.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {j.company_name}
                    {j.location ? ` · ${j.location}` : ""}
                  </span>
                </span>
                <MatchBadge similarity={j.similarity} />
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/candidate/jobs?tab=recommended"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          See all recommendations{" "}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}

export function ScoreCard({
  score,
  improvements,
}: {
  score: number;
  improvements: Overview["improvements"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="size-4 text-muted-foreground" aria-hidden />
          ATS score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-mono text-5xl font-semibold tabular-nums text-primary">
          {score.toFixed(2)}
          <span className="ml-1 text-base text-muted-foreground">/ 100</span>
        </p>
        {improvements.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Top improvements
            </p>
            <ul className="space-y-1.5">
              {improvements.map((imp) => (
                <li key={imp.name} className="flex items-start gap-2 text-sm">
                  <Wrench
                    className="mt-0.5 size-3.5 shrink-0 text-warning"
                    aria-hidden
                  />
                  <span>
                    <span className="font-medium">{imp.name}</span>{" "}
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      ({imp.score}/{imp.max})
                    </span>{" "}
                    <span className="text-muted-foreground">
                      — {imp.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Perfect score — nothing to improve.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function SkillsCard({ skills }: { skills: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="size-4 text-muted-foreground" aria-hidden />
          Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No skills yet — they appear when your resume is read.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </div>
        )}
        <Link
          href="/candidate/resume"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Edit skills <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}

const CHECK_ITEMS: {
  key: keyof Overview["completeness"];
  label: string;
  href: string;
  fix: string;
}[] = [
  {
    key: "profile_complete",
    label: "Profile filled in",
    href: "/candidate/profile",
    fix: "Set location, experience and job type",
  },
  {
    key: "resume_uploaded",
    label: "Resume uploaded",
    href: "/candidate/resume",
    fix: "Upload your resume",
  },
  {
    key: "resume_parsed",
    label: "Resume read successfully",
    href: "/candidate/resume",
    fix: "Check your resume status",
  },
];

export function CompletenessCard({
  completeness,
}: {
  completeness: Overview["completeness"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="size-4 text-muted-foreground" aria-hidden />
          Ready to match
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5">
          {CHECK_ITEMS.map((item) => {
            const done = completeness[item.key];
            return (
              <li key={item.key} className="flex items-center gap-2 text-sm">
                {done ? (
                  <CheckCircle2
                    className="size-4 shrink-0 text-success"
                    aria-hidden
                  />
                ) : (
                  <Circle
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                )}
                <span className={done ? "" : "text-muted-foreground"}>
                  {item.label}
                </span>
                {!done && (
                  <Link
                    href={item.href}
                    className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {item.fix} <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

export function NewAccountFunnel({
  profileComplete,
}: {
  profileComplete: boolean;
}) {
  return (
    <EmptyState
      icon={FileText}
      title="Let’s get you matchable."
      sub={
        profileComplete
          ? "Your profile is set — upload your resume to unlock your ATS score and job matches."
          : "Two steps: fill in your profile, then upload your resume to unlock your ATS score and job matches."
      }
      action={
        <div className="flex gap-2">
          {!profileComplete && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/candidate/profile">Fill profile</Link>
            </Button>
          )}
          <Button size="sm" asChild>
            <Link href="/candidate/resume">Upload resume</Link>
          </Button>
        </div>
      }
    />
  );
}
