import { z } from "zod";

export const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000+",
] as const;

// Mirrors the API's CompanyCreate/Update (app/schemas/company.py).
export const companySchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  website: z.string().trim().max(200).nullable(),
  size: z.enum(COMPANY_SIZES).nullable(),
  about: z.string().trim().max(2000).nullable(),
});

export type CompanyForm = z.infer<typeof companySchema>;
export type Company = CompanyForm & { id: string };
