import { z } from "zod";

// Mirrors the API's CandidateProfileUpdate field-for-field (app/schemas/candidate.py).
export const JOB_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "internship",
] as const;

export const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Required").max(200),
  headline: z.string().trim().max(200).nullable(),
  location: z.string().trim().max(120).nullable(),
  years_experience: z
    .number({ message: "Enter a number" })
    .min(0, "Cannot be negative")
    .max(50, "Max 50")
    .nullable(),
  desired_job_type: z.enum(JOB_TYPES).nullable(),
  open_to_remote: z.boolean(),
});

export type ProfileForm = z.infer<typeof profileSchema>;
