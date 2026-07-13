"use client";

import { useState } from "react";
import {
  Award,
  Briefcase,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Upload,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getAccessToken,
  type ParsedResume,
  updateSkills,
} from "@/lib/upload-resume";

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
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-muted-foreground" aria-hidden />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// Honest empty text — never a blank hole.
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function SkillsEditor({
  resumeId,
  initial,
}: {
  resumeId: string;
  initial: string[];
}) {
  const [skills, setSkills] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function persist(next: string[], prev: string[]) {
    setBusy(true);
    setSkills(next);
    try {
      const token = await getAccessToken();
      const saved = await updateSkills(resumeId, next, token);
      setSkills(saved.skills ?? []);
    } catch {
      setSkills(prev); // revert
      toast.error("Could not save skills");
    } finally {
      setBusy(false);
    }
  }

  function add() {
    const s = draft.trim();
    if (!s) return;
    if (skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setDraft("");
      return;
    }
    setDraft("");
    persist([...skills, s], skills);
  }

  function remove(skill: string) {
    persist(
      skills.filter((s) => s !== skill),
      skills,
    );
  }

  return (
    <div className="space-y-3">
      {skills.length === 0 ? (
        <Empty>
          No skills found in your resume. Add the ones that describe you.
        </Empty>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <Badge key={s} variant="secondary" className="gap-1 pr-1">
              {s}
              <button
                type="button"
                onClick={() => remove(s)}
                disabled={busy}
                aria-label={`Remove ${s}`}
                className="rounded-full p-0.5 hover:bg-foreground/10"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add a skill and press Enter"
          className="max-w-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={add}
          disabled={busy}
          aria-label="Add skill"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function ResumeReview({
  resumeId,
  parsed,
  skills,
  onReupload,
  onReparse,
}: {
  resumeId: string;
  parsed: ParsedResume;
  skills: string[];
  onReupload: () => void;
  onReparse: () => void;
}) {
  const c = parsed.contact;
  const hasContact = c.name || c.email || c.phone || c.location;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Here’s what we read from your resume. Skills feed your matches — tidy
          them up below.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onReparse}>
            <RefreshCw className="size-4" /> Re-parse
          </Button>
          <Button variant="outline" size="sm" onClick={onReupload}>
            <Upload className="size-4" /> Re-upload
          </Button>
        </div>
      </div>

      <Section icon={User} title="Contact">
        {hasContact ? (
          <div className="grid gap-1.5 text-sm">
            {c.name && <p className="font-medium">{c.name}</p>}
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
          <Empty>No contact details found in your resume.</Empty>
        )}
        {parsed.summary && (
          <p className="mt-3 text-sm text-muted-foreground">{parsed.summary}</p>
        )}
      </Section>

      <Section icon={Briefcase} title="Skills">
        <SkillsEditor resumeId={resumeId} initial={skills} />
      </Section>

      <Section icon={Briefcase} title="Experience">
        {parsed.experience.length === 0 ? (
          <Empty>No work experience found in your resume.</Empty>
        ) : (
          <ol className="relative space-y-5 border-l border-border pl-5">
            {parsed.experience.map((exp, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full bg-primary" />
                <p className="text-sm font-medium">
                  {exp.title ?? "Role"}
                  {exp.company && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {exp.company}
                    </span>
                  )}
                </p>
                {(exp.start || exp.end || exp.current) && (
                  <p className="text-xs text-muted-foreground">
                    {exp.start ?? "?"} –{" "}
                    {exp.current ? "Present" : (exp.end ?? "?")}
                  </p>
                )}
                {exp.bullets.length > 0 && (
                  <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-sm text-muted-foreground">
                    {exp.bullets.map((b, j) => (
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
        {parsed.education.length === 0 ? (
          <Empty>No education found in your resume.</Empty>
        ) : (
          <ul className="space-y-2 text-sm">
            {parsed.education.map((ed, i) => (
              <li key={i}>
                <span className="font-medium">
                  {ed.degree ?? "Qualification"}
                </span>
                {ed.institution && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {ed.institution}
                  </span>
                )}
                {ed.year && (
                  <span className="text-muted-foreground"> ({ed.year})</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section icon={Award} title="Certifications">
        {parsed.certifications.length === 0 ? (
          <Empty>No certifications found in your resume.</Empty>
        ) : (
          <ul className="list-disc space-y-1 pl-4 text-sm">
            {parsed.certifications.map((cert, i) => (
              <li key={i}>{cert}</li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
