"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { Briefcase, Users, CheckCircle, Percent } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { LottiePlaceholder } from "@/components/lottie-placeholder";

export type AnalyticsData = {
  total_open_jobs: number;
  total_applicants: number;
  avg_match_score: number | null;
  total_shortlisted: number;
  funnel: Record<string, number>;
  daily_applications: { date: string; count: number }[];
  jobs: { job_id: string; title: string; applicant_count: number; top_score: number | null }[];
};

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  if (data.total_open_jobs === 0 && data.total_applicants === 0) {
    return (
      <div className="pt-8 flex flex-col items-center text-center max-w-md mx-auto space-y-6">
        <LottiePlaceholder 
          src="https://lottie.host/80bb6e23-74b8-469b-9c71-26ec037a3536/HwO2QxR01u.json"
          className="w-48 h-48 mb-4 opacity-80"
        />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-100">Welcome to your dashboard</h2>
          <p className="text-sm text-neutral-400">You don't have any open jobs yet. Post your first job to start receiving ranked applicants.</p>
        </div>
        <Button asChild className="shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-shadow rounded-full group overflow-hidden relative">
          <Link href="/recruiter/jobs/new">
            <span className="relative z-10">Post a Job</span>
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </Link>
        </Button>
      </div>
    );
  }

  const statusOrder = ["applied", "screening", "shortlisted", "interview", "hired", "rejected"];
  const funnelData = statusOrder.map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    count: data.funnel[s] || 0
  }));

  const chartTheme = {
    color: "var(--primary)",
    bg: "var(--background)",
    grid: "var(--border)",
    text: "var(--muted-foreground)"
  };

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <BentoGrid className="max-w-none md:auto-rows-[10rem]">
        <BentoGridItem
          title={`${data.total_open_jobs}`}
          description="Open Jobs"
          icon={<Briefcase className="h-6 w-6 text-primary" />}
          className="bg-neutral-950 border-white/10"
        />
        <BentoGridItem
          title={`${data.total_applicants}`}
          description="Total Applicants"
          icon={<Users className="h-6 w-6 text-accent-2" />}
          className="bg-neutral-950 border-white/10"
        />
        <BentoGridItem
          title={data.avg_match_score !== null ? `${Math.round(data.avg_match_score * 100)}%` : "--"}
          description="Avg Match Score"
          icon={<Percent className="h-6 w-6 text-success" />}
          className="bg-neutral-950 border-white/10"
        />
        <BentoGridItem
          title={`${data.total_shortlisted}`}
          description="Shortlisted+"
          icon={<CheckCircle className="h-6 w-6 text-warning" />}
          className="bg-neutral-950 border-white/10"
        />
      </BentoGrid>

      {/* Charts Row */}
      <BentoGrid className="max-w-none md:auto-rows-[24rem]">
        <BentoGridItem
          className="md:col-span-2 bg-neutral-950 border-white/10"
          title="Application Funnel"
          description="Current status of all active applications"
          header={
            <div className="h-full w-full min-h-[12rem] flex flex-1 w-full rounded-xl bg-dot-grid [mask-image:linear-gradient(to_bottom,white,transparent)] flex flex-col justify-end pb-4 relative overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartTheme.grid} />
                  <XAxis type="number" stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: chartTheme.bg, borderColor: chartTheme.grid, borderRadius: '6px' }}
                  />
                  <Bar dataKey="count" fill={chartTheme.color} radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        />
        <BentoGridItem
          className="md:col-span-1 bg-neutral-950 border-white/10"
          title="Daily Volume"
          description="Applications (14 days)"
          header={
            <div className="h-full w-full min-h-[12rem] flex flex-1 w-full rounded-xl bg-dot-grid [mask-image:linear-gradient(to_bottom,white,transparent)] flex flex-col justify-end pb-4 relative overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.daily_applications} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                  <XAxis 
                    dataKey="date" 
                    stroke={chartTheme.text} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => {
                      const date = new Date(val);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: chartTheme.bg, borderColor: chartTheme.grid, borderRadius: '6px' }}
                  />
                  <Line type="monotone" dataKey="count" stroke={chartTheme.color} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          }
        />
      </BentoGrid>

      <BentoGrid className="max-w-none md:auto-rows-[minmax(18rem,auto)]">
        <BentoGridItem
          className="md:col-span-3 bg-neutral-950 border-white/10"
          title="Top Jobs"
          description="Your jobs with the most applicants"
          header={
            <TopJobsList data={data} />
          }
        />
      </BentoGrid>
    </div>
  );
}

import { useAutoAnimate } from '@formkit/auto-animate/react';

function TopJobsList({ data }: { data: AnalyticsData }) {
  const [parent] = useAutoAnimate();
  
  return (
    <div ref={parent} className="space-y-4 px-2 pt-2">
      {data.jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8 bg-black/20 rounded-lg border border-white/5">No applicants yet.</p>
      ) : (
        data.jobs.map(job => (
          <div key={job.job_id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
            <div className="space-y-1">
              <Link href={`/recruiter/jobs/${job.job_id}/applicants`} className="text-sm font-medium hover:text-primary transition-colors text-neutral-200">
                {job.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                {job.applicant_count} applicants
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {job.top_score !== null ? `${Math.round(job.top_score * 100)}% Match` : "Pending"}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
