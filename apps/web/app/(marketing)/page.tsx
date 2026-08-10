import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, BarChart3, Search, Lightbulb } from "lucide-react";
import { GSAPAnimations } from "./gsap-animations";

export default function MarketingPage() {
  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      <GSAPAnimations />
      {/* Hero Section */}
      <section className="w-full max-w-6xl px-4 sm:px-8 pt-24 pb-20 md:pt-32 md:pb-32 text-center">
        <h1 className="hero-headline font-heading text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto">
          Hiring, with reasons.
        </h1>
        <p className="hero-subline mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          AI matching you can trust. We don&apos;t just score candidates; we show you exactly why they fit your role, based on semantic analysis and extracted skills.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="hero-cta h-12 px-8 text-base" asChild>
            <Link href="/signup?role=recruiter">Hire Smarter <ChevronRight className="ml-2 size-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" className="hero-cta h-12 px-8 text-base" asChild>
            <Link href="/signup?role=candidate">Find Your Fit</Link>
          </Button>
        </div>
      </section>

      {/* How Matching Works */}
      <section className="w-full bg-surface/50 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-semibold">How matching works</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Our hybrid engine evaluates candidates on semantic similarity, skill overlap, and experience fit to deliver a transparent, accurate ranking.
            </p>
          </div>

          <div className="steps-container grid md:grid-cols-3 gap-8">
            <div className="step-card flex flex-col items-center text-center p-6">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Search className="size-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Understand</h3>
              <p className="text-muted-foreground">
                We parse your resume and job description using LLMs to extract core skills and structure experience into actionable data.
              </p>
            </div>
            <div className="step-card flex flex-col items-center text-center p-6">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <BarChart3 className="size-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Filter</h3>
              <p className="text-muted-foreground">
                Hard filters like remote preferences and minimum experience are applied instantly, ensuring you only see viable candidates.
              </p>
            </div>
            <div className="step-card flex flex-col items-center text-center p-6">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Lightbulb className="size-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Explain</h3>
              <p className="text-muted-foreground">
                We rerank the shortlist and provide a transparent breakdown of why they fit, highlighting exactly what skills overlap and what&apos;s missing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-24 space-y-32">
        
        {/* Feature 1: ATS Score */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative rounded-xl overflow-hidden border border-border/50 bg-surface shadow-lg">
            <Image 
              src="/images/candidate_dashboard_ats.png" 
              alt="Candidate Dashboard ATS Score" 
              width={800} 
              height={500} 
              className="w-full h-auto"
            />
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
              For Candidates
            </div>
            <h2 className="font-heading text-3xl font-semibold">Deterministic ATS scoring</h2>
            <p className="text-muted-foreground text-lg">
              Know exactly where your resume stands before you apply. Our rules-based ATS scorer evaluates your resume against industry standards and gives you actionable feedback on how to improve.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-primary" /> Instant feedback on formatting and length
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-primary" /> Bullet quantification checks
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 2: Ranked Pipeline */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-accent-2/10 text-accent-2 border-accent-2/20">
              For Recruiters
            </div>
            <h2 className="font-heading text-3xl font-semibold">Ranked talent pipelines</h2>
            <p className="text-muted-foreground text-lg">
              Stop sifting through hundreds of unqualified resumes. Your applicant tracking board is automatically sorted by our hybrid match score.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-accent-2" /> Top candidates surface automatically
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-accent-2" /> Filtered by non-negotiable requirements
              </li>
            </ul>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-border/50 bg-surface shadow-lg">
            <Image 
              src="/images/recruiter_applicant_table.png" 
              alt="Recruiter Applicant Table" 
              width={800} 
              height={500} 
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Feature 3: Skill Gap Analysis */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative rounded-xl overflow-hidden border border-border/50 bg-surface shadow-lg">
            <Image 
              src="/images/fit_analysis_panel.png" 
              alt="Skill Gap Analysis Panel" 
              width={800} 
              height={500} 
              className="w-full h-auto"
            />
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="font-heading text-3xl font-semibold">Honest skill gap analysis</h2>
            <p className="text-muted-foreground text-lg">
              We extract and compare the skills from the candidate&apos;s resume against the required skills of the job posting. See immediately what they bring to the table and what they&apos;re missing.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-primary" /> Visual gap breakdown
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-primary" /> AI-generated narrative explanation
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 4: Explainable Match */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-heading text-3xl font-semibold">Explainable matching</h2>
            <p className="text-muted-foreground text-lg">
              Never trust a black-box score again. Our match score card shows you the exact weighting of semantic similarity, skill overlap, and experience fit that went into the final percentage.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-accent-2" /> 100% transparent formula
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-accent-2" /> Detailed weight redistribution logic
              </li>
            </ul>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-border/50 bg-surface shadow-lg">
            <Image 
              src="/images/match_score_card.png" 
              alt="Match Score Card" 
              width={800} 
              height={500} 
              className="w-full h-auto"
            />
          </div>
        </div>

      </section>
      
      {/* CTA Section */}
      <section className="w-full bg-primary/5 py-24 text-center border-t border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 space-y-8">
          <h2 className="font-heading text-3xl md:text-5xl font-bold">Ready to see why?</h2>
          <p className="text-lg text-muted-foreground">
            Join the platform that puts transparency and evidence behind every match.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/signup">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
