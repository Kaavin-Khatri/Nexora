"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ApiError, api } from "@/lib/api-client";
import {
  JOB_TYPES,
  profileSchema,
  type ProfileForm,
} from "@/lib/candidate-schema";
import { createClient } from "@/lib/supabase/client";

const NONE = "__none__"; // Select can't hold an empty value; maps to null.

const JOB_TYPE_LABELS: Record<(typeof JOB_TYPES)[number], string> = {
  full_time: "Full time",
  part_time: "Part time",
  contract: "Contract",
  internship: "Internship",
};

export function ProfileFormCard({ initial }: { initial: ProfileForm }) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
  });

  async function onSubmit(values: ProfileForm) {
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const saved = await api<ProfileForm>("/candidates/me", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify(values),
      });
      reset(saved); // clears dirty state, syncs to server truth
      toast.success("Profile saved");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-xl">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Field data-invalid={!!errors.full_name}>
            <FieldLabel htmlFor="full_name">Full name</FieldLabel>
            <Input
              id="full_name"
              placeholder="e.g. Ananya Sharma"
              {...register("full_name")}
            />
            {errors.full_name && (
              <FieldError>{errors.full_name.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="headline">Headline</FieldLabel>
            <Input
              id="headline"
              placeholder="e.g. Backend engineer, 3 years in fintech"
              {...register("headline", {
                setValueAs: (v) => (v === "" ? null : v),
              })}
            />
            <FieldDescription>
              A one-line summary shown on your profile.
            </FieldDescription>
          </Field>

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

          <Field data-invalid={!!errors.years_experience}>
            <FieldLabel htmlFor="years_experience">
              Years of experience
            </FieldLabel>
            <Input
              id="years_experience"
              type="number"
              min={0}
              max={50}
              step={0.5}
              placeholder="0"
              {...register("years_experience", {
                setValueAs: (v) => (v === "" ? null : Number(v)),
              })}
            />
            {errors.years_experience && (
              <FieldError>{errors.years_experience.message}</FieldError>
            )}
          </Field>

          <Controller
            control={control}
            name="desired_job_type"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="desired_job_type">
                  Desired job type
                </FieldLabel>
                <Select
                  value={field.value ?? NONE}
                  onValueChange={(v) => field.onChange(v === NONE ? null : v)}
                >
                  <SelectTrigger id="desired_job_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>No preference</SelectItem>
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
            name="open_to_remote"
            render={({ field }) => (
              <Field orientation="horizontal">
                <FieldLabel htmlFor="open_to_remote">
                  Open to remote work
                </FieldLabel>
                <Switch
                  id="open_to_remote"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />

          <Button type="submit" disabled={saving || !isDirty}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
