"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { SkillsTagInput } from "@/components/skills-tag-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, api } from "@/lib/api-client";
import {
  getAccessToken,
  type Job,
  JOB_TYPE_LABELS,
  JOB_TYPES,
  type JobForm,
  jobSchema,
} from "@/lib/jobs";

const NONE = "__none__";

const EMPTY: JobForm = {
  title: "",
  description: "",
  location: null,
  remote: false,
  job_type: null,
  min_experience: null,
  required_skills: [],
};

export function JobFormCard({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Job;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: initial ?? EMPTY,
  });
  const [status, setStatus] = useState<"open" | "closed">(
    initial?.status ?? "open",
  );

  async function onSubmit(values: JobForm) {
    setSaving(true);
    try {
      const token = await getAccessToken();
      const headers = { Authorization: `Bearer ${token}` };
      if (mode === "create") {
        await api("/jobs", {
          method: "POST",
          headers,
          body: JSON.stringify(values),
        });
        toast.success("Job posted");
      } else {
        await api(`/jobs/${initial!.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ ...values, status }),
        });
        toast.success("Job updated");
      }
      router.push("/recruiter/jobs");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not save job");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
      <Field data-invalid={!!errors.title}>
        <FieldLabel htmlFor="title">Job title</FieldLabel>
        <Input
          id="title"
          placeholder="e.g. Backend Engineer"
          {...register("title")}
        />
        {errors.title && <FieldError>{errors.title.message}</FieldError>}
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <Input
            id="location"
            placeholder="e.g. Ahmedabad"
            {...register("location", {
              setValueAs: (v) => (v === "" ? null : v),
            })}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="min_experience">
            Minimum experience (years)
          </FieldLabel>
          <Input
            id="min_experience"
            type="number"
            min={0}
            max={50}
            step={0.5}
            placeholder="0"
            {...register("min_experience", {
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
          />
          {errors.min_experience && (
            <FieldError>{errors.min_experience.message}</FieldError>
          )}
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Controller
          control={control}
          name="job_type"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="job_type">Job type</FieldLabel>
              <Select
                value={field.value ?? NONE}
                onValueChange={(v) => field.onChange(v === NONE ? null : v)}
              >
                <SelectTrigger id="job_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Not specified</SelectItem>
                  {JOB_TYPES.map((jt) => (
                    <SelectItem key={jt} value={jt}>
                      {JOB_TYPE_LABELS[jt]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="remote"
          render={({ field }) => (
            <Field orientation="horizontal">
              <FieldLabel htmlFor="remote">Remote friendly</FieldLabel>
              <Switch
                id="remote"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
      </div>

      <Controller
        control={control}
        name="required_skills"
        render={({ field }) => (
          <Field>
            <FieldLabel>Required skills</FieldLabel>
            <SkillsTagInput value={field.value} onChange={field.onChange} />
            <FieldDescription>
              These drive candidate matching — be specific.
            </FieldDescription>
          </Field>
        )}
      />

      <Field data-invalid={!!errors.description}>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Textarea
          id="description"
          rows={10}
          placeholder="Describe the role, responsibilities and what a great candidate looks like…"
          {...register("description")}
        />
        <FieldDescription>
          At least 50 characters — the richer this is, the better the AI
          matching works.
        </FieldDescription>
        {errors.description && (
          <FieldError>{errors.description.message}</FieldError>
        )}
      </Field>

      {mode === "edit" && (
        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as "open" | "closed")}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open — visible to candidates</SelectItem>
              <SelectItem value="closed">
                Closed — hidden from browse
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : mode === "create" ? "Post job" : "Save changes"}
      </Button>
    </form>
  );
}
