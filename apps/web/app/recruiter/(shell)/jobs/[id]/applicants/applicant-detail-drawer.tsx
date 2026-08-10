"use client";

import {
  Award,
  Briefcase,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchScoreCard } from "@/components/ui-patterns/match-score-card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, type Status } from "@/components/ui-patterns/status-badge";
import type { Applicant } from "./applicants-table";
import { getMatchTier } from "@/lib/match-constants";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Icon className="size-4 text-muted-foreground" aria-hidden />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-3 pt-0 text-sm">{children}</CardContent>
    </Card>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground">{children}</p>;
}

export function ApplicantDetailDrawer({
  applicant,
  open,
  onOpenChange,
}: {
  applicant: Applicant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!applicant) {
    return <Sheet open={open} onOpenChange={onOpenChange} />;
  }

  const parsed = applicant.resume.parsed_json;
  const c = parsed?.contact || {};
  const hasContact = c.name || c.email || c.phone || c.location;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex justify-between items-start pr-6">
            <div>
              <SheetTitle className="text-xl">{applicant.candidate.full_name}</SheetTitle>
              <SheetDescription className="text-base text-foreground mt-1">
                {applicant.candidate.headline || "No headline"}
              </SheetDescription>
              <div className="flex items-center gap-2 mt-3">
                <StatusBadge status={applicant.status as Status} />
                <span className="text-sm text-muted-foreground">
                  Applied {new Date(applicant.applied_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            {applicant.match_score !== null && (
              <div className="flex flex-col items-end">
                <span className="font-mono text-2xl font-semibold">
                  {Math.round(applicant.match_score * 100)}%
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  {getMatchTier(applicant.match_score).label}
                </span>
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-12">
          {applicant.match_score !== null && applicant.match_breakdown && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Match Snapshot
              </p>
              <MatchScoreCard
                score={applicant.match_score}
                breakdown={applicant.match_breakdown}
              />
            </div>
          )}

          <Section icon={User} title="Contact & Summary">
            {hasContact ? (
              <div className="grid gap-1.5 mb-3">
                {c.email && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-3.5" /> {c.email}
                  </p>
                )}
                {c.phone && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-3.5" /> {c.phone}
                  </p>
                )}
                {c.location && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-3.5" /> {c.location}
                  </p>
                )}
              </div>
            ) : (
              <Empty>No contact details extracted.</Empty>
            )}
            {parsed?.summary && <p className="text-muted-foreground">{parsed.summary}</p>}
          </Section>

          <Section icon={Briefcase} title="Skills">
            {applicant.resume.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {applicant.resume.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="px-2 py-0.5 font-normal">
                    {s}
                  </Badge>
                ))}
              </div>
            ) : (
              <Empty>No skills extracted.</Empty>
            )}
          </Section>

          <Section icon={Briefcase} title="Experience">
            {!parsed?.experience || parsed.experience.length === 0 ? (
              <Empty>No work experience found.</Empty>
            ) : (
              <ol className="relative space-y-5 border-l border-border pl-5">
                {parsed.experience.map((exp: any, i: number) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full bg-primary" />
                    <p className="font-medium">
                      {exp.title ?? "Role"}
                      {exp.company && <span className="text-muted-foreground"> · {exp.company}</span>}
                    </p>
                    {(exp.start || exp.end || exp.current) && (
                      <p className="text-xs text-muted-foreground mb-1.5">
                        {exp.start ?? "?"} – {exp.current ? "Present" : exp.end ?? "?"}
                      </p>
                    )}
                    {exp.bullets?.length > 0 && (
                      <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground">
                        {exp.bullets.map((b: string, j: number) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Section>

          <Section icon={GraduationCap} title="Education">
            {!parsed?.education || parsed.education.length === 0 ? (
              <Empty>No education found.</Empty>
            ) : (
              <ul className="space-y-3">
                {parsed.education.map((edu: any, i: number) => (
                  <li key={i}>
                    <p className="font-medium">{edu.degree ?? "Degree"}</p>
                    {edu.school && <p className="text-muted-foreground">{edu.school}</p>}
                    {(edu.start || edu.end || edu.current) && (
                      <p className="text-xs text-muted-foreground">
                        {edu.start ?? "?"} – {edu.current ? "Present" : edu.end ?? "?"}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
