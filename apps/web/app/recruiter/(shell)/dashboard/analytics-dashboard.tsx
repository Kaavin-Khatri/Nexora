"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { Briefcase, Users, CheckCircle, Percent } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { Button } from "@/components/ui/button";

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
      <div className="pt-8">
        <EmptyState
          icon={Briefcase}
          title="Welcome to your dashboard"
          sub="You don't have any open jobs yet. Post your first job to start receiving ranked applicants."
          action={
            <Button asChild>
              <Link href="/recruiter/jobs/new">Post a Job</Link>
            </Button>
          }
        />
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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{data.total_open_jobs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{data.total_applicants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {data.avg_match_score !== null ? Math.round(data.avg_match_score * 100) : "--"}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted+</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{data.total_shortlisted}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Application Funnel</CardTitle>
            <CardDescription>Current status of all active applications</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartTheme.grid} />
                <XAxis type="number" stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)' }}
                  contentStyle={{ backgroundColor: chartTheme.bg, borderColor: chartTheme.grid, borderRadius: '6px' }}
                />
                <Bar dataKey="count" fill={chartTheme.color} radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Applications (14 days)</CardTitle>
            <CardDescription>Daily application volume</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Jobs</CardTitle>
          <CardDescription>Your jobs with the most applicants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No applicants yet.</p>
            ) : (
              data.jobs.map(job => (
                <div key={job.job_id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Link href={`/recruiter/jobs/${job.job_id}/applicants`} className="text-sm font-medium hover:underline">
                      {job.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {job.applicant_count} applicants
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-medium">
                      {job.top_score !== null ? `${Math.round(job.top_score * 100)}%` : "--"}
                    </p>
                    <p className="text-xs text-muted-foreground">Top Score</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
