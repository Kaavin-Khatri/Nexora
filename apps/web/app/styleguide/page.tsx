"use client";

// Dev-only visual regression page: every token + every primitive in one place.
// If this page looks right, the design system is intact.
import { useState } from "react";
import { notFound } from "next/navigation";
import { Briefcase } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/ui-patterns/data-table";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import {
  SkeletonCard,
  SkeletonForm,
  SkeletonTable,
} from "@/components/ui-patterns/skeletons";
import {
  ALL_STATUSES,
  StatusBadge,
  type Status,
} from "@/components/ui-patterns/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TOKENS = [
  { name: "background", cls: "bg-background" },
  { name: "surface (card)", cls: "bg-surface" },
  { name: "surface-2 (muted)", cls: "bg-surface-2" },
  { name: "border", cls: "bg-border" },
  { name: "accent (primary)", cls: "bg-primary" },
  { name: "accent-2 (secondary)", cls: "bg-accent-2" },
  { name: "success", cls: "bg-success" },
  { name: "warning", cls: "bg-warning" },
  { name: "danger", cls: "bg-danger" },
  { name: "text", cls: "bg-foreground" },
  { name: "text-muted", cls: "bg-text-muted" },
];

type DemoRow = { id: string; job: string; status: Status; score: number };

const DEMO_ROWS: DemoRow[] = [
  { id: "1", job: "AI Engineer", status: "shortlisted", score: 88.4 },
  { id: "2", job: "Backend Engineer", status: "screening", score: 76.2 },
  { id: "3", job: "Data Analyst", status: "applied", score: 72.15 },
];

const DEMO_COLS: Column<DemoRow>[] = [
  { key: "job", header: "Job", cell: (r) => r.job, sortValue: (r) => r.job },
  {
    key: "status",
    header: "Status",
    cell: (r) => <StatusBadge status={r.status} />,
  },
  {
    key: "score",
    header: "Score",
    cell: (r) => (
      <span className="font-mono tabular-nums">{r.score.toFixed(2)}</span>
    ),
    sortValue: (r) => r.score,
    className: "text-right",
  },
];

function DataTableDemo() {
  const [mode, setMode] = useState<"loading" | "data" | "empty">("data");
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["loading", "data", "empty"] as const).map((m) => (
          <Button
            key={m}
            size="sm"
            variant={mode === m ? "default" : "outline"}
            onClick={() => setMode(m)}
            className="capitalize"
          >
            {m}
          </Button>
        ))}
      </div>
      <DataTable
        columns={DEMO_COLS}
        data={mode === "data" ? DEMO_ROWS : []}
        loading={mode === "loading"}
        rowKey={(r) => r.id}
        empty={
          <EmptyState
            icon={Briefcase}
            title="No applications yet."
            sub="Apply to a job and it will show up here with its match score."
          />
        }
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <TooltipProvider>
      <main className="mx-auto max-w-5xl space-y-12 p-8">
        <header>
          <h1 className="text-3xl font-semibold">Nexora styleguide</h1>
          <p className="mt-1 text-muted-foreground">
            Every token and primitive. Dev-only visual regression check.
          </p>
        </header>

        <Section title="Color tokens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {TOKENS.map((t) => (
              <div key={t.name} className="rounded-lg border border-border p-2">
                <div className={`h-12 rounded-md ${t.cls}`} />
                <p className="mt-2 text-xs text-muted-foreground">{t.name}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold">Display / Sora 36 bold</h1>
            <h2 className="text-2xl font-semibold">
              Heading 2 / Sora 24 semibold
            </h2>
            <h3 className="text-xl font-semibold">
              Heading 3 / Sora 20 semibold
            </h3>
            <p className="text-base">
              Body / Inter 16 — Nexora matches candidates to jobs with vector
              search and transparent score breakdowns.
            </p>
            <p className="text-sm text-muted-foreground">
              Muted / Inter 14 — secondary copy.
            </p>
            <p className="font-mono text-2xl tabular-nums">
              87.50{" "}
              <span className="text-sm text-muted-foreground">
                / match score, JetBrains Mono
              </span>
            </p>
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </Section>

        <Section title="StatusBadge — every variant">
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
        </Section>

        <Section title="Card">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Backend Engineer</CardTitle>
              <CardDescription>
                PayOrbit — Ahmedabad · full-time
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Match score</span>
              <span className="font-mono text-xl tabular-nums text-primary">
                92.10
              </span>
            </CardContent>
          </Card>
        </Section>

        <Section title="Form controls">
          <div className="grid max-w-md gap-6">
            <Field>
              <FieldLabel htmlFor="sg-name">Full name</FieldLabel>
              <Input id="sg-name" placeholder="Ananya Sharma" />
              <FieldDescription>Shown on your profile.</FieldDescription>
            </Field>
            <div className="grid gap-2">
              <Label htmlFor="sg-role">Desired job type</Label>
              <Select>
                <SelectTrigger id="sg-role">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full time</SelectItem>
                  <SelectItem value="part_time">Part time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>

        <Section title="Tabs">
          <Tabs defaultValue="jobs" className="max-w-md">
            <TabsList>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
            </TabsList>
            <TabsContent value="jobs" className="text-sm text-muted-foreground">
              Open roles appear here.
            </TabsContent>
            <TabsContent
              value="applications"
              className="text-sm text-muted-foreground"
            >
              Your applications appear here.
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>AI Engineer</TableCell>
                <TableCell>
                  <StatusBadge status="shortlisted" />
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  88.40
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Data Analyst</TableCell>
                <TableCell>
                  <Badge variant="secondary">applied</Badge>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  72.15
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        <Section title="Overlays & feedback">
          <div className="flex flex-wrap items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm application</DialogTitle>
                  <DialogDescription>
                    Apply to Backend Engineer at PayOrbit?
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Job details</SheetTitle>
                  <SheetDescription>
                    Slide-over panel used for detail views.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Dropdown</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem className="text-danger">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>Explains the thing.</TooltipContent>
            </Tooltip>
            <Button
              variant="secondary"
              onClick={() => toast.success("Profile saved")}
            >
              Toast
            </Button>
          </div>
        </Section>

        <Section title="Loading & identity">
          <div className="flex items-center gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-64" />
            </div>
            <Avatar>
              <AvatarFallback>NX</AvatarFallback>
            </Avatar>
          </div>
        </Section>

        <Section title="Skeleton patterns">
          <div className="grid gap-6 md:grid-cols-2">
            <SkeletonCard />
            <SkeletonForm fields={2} />
          </div>
          <SkeletonTable rows={2} cols={4} />
        </Section>

        <Section title="EmptyState">
          <EmptyState
            icon={Briefcase}
            title="No jobs yet."
            sub="Post your first job to start receiving ranked candidate matches."
            action={<Button size="sm">Post a job</Button>}
          />
        </Section>

        <Section title="DataTable — loading / data / empty">
          <DataTableDemo />
        </Section>
      </main>
    </TooltipProvider>
  );
}
