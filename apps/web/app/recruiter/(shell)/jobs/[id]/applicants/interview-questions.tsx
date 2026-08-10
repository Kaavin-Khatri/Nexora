"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Sparkles, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export type Question = {
  id: string;
  question: string;
  category: string;
  targets_skill: string | null;
  created_at: string;
};

export function InterviewQuestions({ applicationId, isCandidate = false }: { applicationId: string, isCandidate?: boolean }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchQuestions = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const data = await api<Question[]>(`/applications/${applicationId}/interview-questions`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (mounted) {
          setQuestions(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) setLoading(false);
      }
    };
    fetchQuestions();
    return () => { mounted = false; };
  }, [applicationId]);

  const generate = async (regenerate = false) => {
    setGenerating(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No token");

      const data = await api<Question[]>(`/applications/${applicationId}/interview-questions?regenerate=${regenerate}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setQuestions(data);
      toast.success(regenerate ? "Questions regenerated!" : "Questions generated successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const copyAll = () => {
    const text = questions.map((q, i) => `${i + 1}. ${q.question} [${q.category}]`).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (questions.length === 0) {
    if (isCandidate) {
      return (
        <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground mt-4">
          <p className="text-sm">The recruiter hasn&apos;t generated your interview prep questions yet.</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8 border border-dashed rounded-lg mt-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <Sparkles className="size-6 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="font-medium">Generate Interview Prep</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            AI will analyze the candidate&apos;s matched skills and missing gaps to generate 8 targeted interview questions.
          </p>
        </div>
        <Button onClick={() => generate(false)} disabled={generating}>
          {generating && <Loader2 className="mr-2 size-4 animate-spin" />}
          Generate Questions
        </Button>
      </div>
    );
  }

  const technical = questions.filter(q => q.category === "technical");
  const missing = questions.filter(q => q.category === "missing_skill");
  const behavioral = questions.filter(q => q.category === "behavioral");

  const renderGroup = (title: string, items: Question[], badgeStyle: string) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-3 mt-6">
        <h4 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">{title} ({items.length})</h4>
        <div className="space-y-3">
          {items.map(q => (
            <Card key={q.id}>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium">{q.question}</p>
                  {q.targets_skill && (
                    <Badge variant="outline" className={badgeStyle}>
                      Target: {q.targets_skill}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => {
                  navigator.clipboard.writeText(q.question);
                  toast.success("Question copied!");
                }}>
                  <Copy className="size-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 mt-4 pb-12">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Generated strictly from resume context.</p>
        <div className="flex gap-2">
          {!isCandidate && (
            <Button variant="outline" size="sm" onClick={() => generate(true)} disabled={generating}>
              {generating && <Loader2 className="mr-2 size-3 animate-spin" />}
              Regenerate
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={copyAll}>
            <Copy className="mr-2 size-3" /> Copy All
          </Button>
        </div>
      </div>
      
      {renderGroup("Technical Strengths", technical, "border-primary/30 text-primary")}
      {renderGroup("Missing Skills (Probing)", missing, "border-destructive/30 text-destructive")}
      {renderGroup("Behavioral", behavioral, "")}
    </div>
  );
}
