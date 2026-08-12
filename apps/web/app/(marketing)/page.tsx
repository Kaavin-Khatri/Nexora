import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, BarChart3, Search, Lightbulb } from "lucide-react";
import { GSAPAnimations } from "./gsap-animations";

export default function MarketingPage() {
  return (
    <div className="flex flex-col items-center overflow-x-hidden bg-dot-grid relative">
      <div className="hero-ambient-glow ambient-glow bg-primary w-[600px] h-[600px] top-[-150px] left-1/2 -translate-x-1/2" />
      <GSAPAnimations />
      {/* Hero Section */}
      <section className="w-full max-w-6xl px-4 sm:px-8 pt-24 pb-20 md:pt-32 md:pb-32 text-center relative z-10">
        <h1 className="hero-headline font-heading text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto drop-shadow-sm">
          Hiring, with reasons.
        </h1>
        <p className="hero-subline mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          AI matching you can trust. We don&apos;t just score candidates; we show you exactly why they fit your role, based on semantic analysis and extracted skills.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="hero-cta h-12 px-8 text-base shadow-lg shadow-primary/25" asChild>
            <Link href="/signup?role=recruiter">Hire Smarter <ChevronRight className="ml-2 size-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" className="hero-cta h-12 px-8 text-base bg-surface backdrop-blur-md" asChild>
            <Link href="/signup?role=candidate">Find Your Fit</Link>
          </Button>
        </div>
      </section>

      {/* How Matching Works */}
      <section className="w-full bg-surface/50 py-24 backdrop-blur-3xl border-y border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-semibold">How matching works</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Our hybrid engine evaluates candidates on semantic similarity, skill overlap, and experience fit to deliver a transparent, accurate ranking.
            </p>
          </div>

          <div className="steps-container grid md:grid-cols-3 gap-8">
            <div className="step-card interactive-card bg-card/40 border border-white/5 rounded-2xl flex flex-col items-center text-center p-8 backdrop-blur-md">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 ring-1 ring-primary/20">
                <Search className="size-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Understand</h3>
              <p className="text-muted-foreground">
                We parse your resume and job description using LLMs to extract core skills and structure experience into actionable data.
              </p>
            </div>
            <div className="step-card interactive-card bg-card/40 border border-white/5 rounded-2xl flex flex-col items-center text-center p-8 backdrop-blur-md">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 ring-1 ring-primary/20">
                <BarChart3 className="size-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Filter</h3>
              <p className="text-muted-foreground">
                Hard filters like remote preferences and minimum experience are applied instantly, ensuring you only see viable candidates.
              </p>
            </div>
            <div className="step-card interactive-card bg-card/40 border border-white/5 rounded-2xl flex flex-col items-center text-center p-8 backdrop-blur-md">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 ring-1 ring-primary/20">
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
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-24 space-y-32 relative z-10">
        
        {/* Feature 1: ATS Score */}
        <div className="feature-row grid md:grid-cols-2 gap-12 items-center">
          <div className="feature-image order-2 md:order-1 relative rounded-2xl overflow-hidden border border-white/10 bg-surface shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent z-10 pointer-events-none" />
            <Image 
              src="/images/candidate_dashboard_ats.png" 
              alt="Candidate Dashboard ATS Score" 
              width={800} 
              height={500} 
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="feature-text order-1 md:order-2 space-y-6">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20 tracking-wide uppercase">
              For Candidates
            </div>
            <h2 className="font-heading text-3xl font-semibold leading-tight">Deterministic ATS scoring</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Know exactly where your resume stands before you apply. Our rules-based ATS scorer evaluates your resume against industry standards and gives you actionable feedback on how to improve.
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" /> 
                <span>Instant feedback on formatting and length</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" /> 
                <span>Bullet quantification checks</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 2: Ranked Pipeline */}
        <div className="feature-row grid md:grid-cols-2 gap-12 items-center">
          <div className="feature-text space-y-6">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-accent-2/10 text-accent-2 border-accent-2/20 tracking-wide uppercase">
              For Recruiters
            </div>
            <h2 className="font-heading text-3xl font-semibold leading-tight">Ranked talent pipelines</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Stop sifting through hundreds of unqualified resumes. Your applicant tracking board is automatically sorted by our hybrid match score.
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-accent-2 shrink-0 mt-0.5" /> 
                <span>Top candidates surface automatically</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-accent-2 shrink-0 mt-0.5" /> 
                <span>Filtered by non-negotiable requirements</span>
              </li>
            </ul>
          </div>
          <div className="feature-image relative rounded-2xl overflow-hidden border border-white/10 bg-surface shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent z-10 pointer-events-none" />
            <Image 
              src="/images/recruiter_applicant_table.png" 
              alt="Recruiter Applicant Table" 
              width={800} 
              height={500} 
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

        {/* Feature 3: Skill Gap Analysis */}
        <div className="feature-row grid md:grid-cols-2 gap-12 items-center">
          <div className="feature-image order-2 md:order-1 relative rounded-2xl overflow-hidden border border-white/10 bg-surface shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent z-10 pointer-events-none" />
            <Image 
              src="/images/fit_analysis_panel.png" 
              alt="Skill Gap Analysis Panel" 
              width={800} 
              height={500} 
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="feature-text order-1 md:order-2 space-y-6">
            <h2 className="font-heading text-3xl font-semibold leading-tight">Honest skill gap analysis</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We extract and compare the skills from the candidate&apos;s resume against the required skills of the job posting. See immediately what they bring to the table and what they&apos;re missing.
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" /> 
                <span>Visual gap breakdown</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" /> 
                <span>AI-generated narrative explanation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 4: Explainable Match */}
        <div className="feature-row grid md:grid-cols-2 gap-12 items-center">
          <div className="feature-text space-y-6">
            <h2 className="font-heading text-3xl font-semibold leading-tight">Explainable matching</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Never trust a black-box score again. Our match score card shows you the exact weighting of semantic similarity, skill overlap, and experience fit that went into the final percentage.
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-accent-2 shrink-0 mt-0.5" /> 
                <span>100% transparent formula</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 text-accent-2 shrink-0 mt-0.5" /> 
                <span>Detailed weight redistribution logic</span>
              </li>
            </ul>
          </div>
          <div className="feature-image relative rounded-2xl overflow-hidden border border-white/10 bg-surface shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent z-10 pointer-events-none" />
            <Image 
              src="/images/match_score_card.png" 
              alt="Match Score Card" 
              width={800} 
              height={500} 
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

      </section>
      
      {/* CTA Section */}
      <section className="w-full relative py-32 text-center border-t border-white/5 overflow-hidden">
        <div className="ambient-glow bg-secondary w-[800px] h-[400px] bottom-0 left-1/2 -translate-x-1/2" />
        <div className="max-w-3xl mx-auto px-4 sm:px-8 space-y-8 relative z-10">
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight">Ready to see why?</h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Join the platform that puts transparency and evidence behind every match.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="h-14 px-10 text-lg shadow-xl shadow-primary/20" asChild>
              <Link href="/signup">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
