import { z } from "zod";
import { JOB_TYPES } from "@/lib/candidate-schema";
import { createClient } from "@/lib/supabase/client";

export { JOB_TYPES };

export const JOB_TYPE_LABELS: Record<(typeof JOB_TYPES)[number], string> = {
  full_time: "Full time",
  part_time: "Part time",
  contract: "Contract",
  internship: "Internship",
};

// Mirrors the API's JobCreate/JobUpdate (app/schemas/job.py).
export const jobSchema = z.object({
  title: z.string().trim().min(1, "Required").max(200),
  description: z
    .string()
    .trim()
    .min(50, "At least 50 characters — the AI mines this text for requirements")
    .max(10000),
  location: z.string().trim().max(120).nullable(),
  remote: z.boolean(),
  job_type: z.enum(JOB_TYPES).nullable(),
  min_experience: z.number().min(0).max(50).nullable(),
  required_skills: z.array(z.string()).max(30),
});

export type JobForm = z.infer<typeof jobSchema>;

export type Job = JobForm & {
  id: string;
  status: "open" | "closed";
  created_at: string;
  company?: {
    id: string;
    name: string;
    website: string | null;
    size: string | null;
    about: string | null;
  };
};

export type JobList = {
  items: Job[];
  total: number;
  limit: number;
  offset: number;
};

export async function getAccessToken(): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? "";
}
