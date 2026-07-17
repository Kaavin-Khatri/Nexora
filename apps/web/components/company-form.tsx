"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, api } from "@/lib/api-client";
import {
  COMPANY_SIZES,
  type Company,
  type CompanyForm,
  companySchema,
} from "@/lib/company";
import { createClient } from "@/lib/supabase/client";

const NONE = "__none__";

const EMPTY: CompanyForm = { name: "", website: null, size: null, about: null };

export function CompanyFormCard({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Company;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: initial ?? EMPTY,
  });

  async function onSubmit(values: CompanyForm) {
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers = { Authorization: `Bearer ${session?.access_token}` };

      if (mode === "create") {
        await api("/companies", {
          method: "POST",
          headers,
          body: JSON.stringify(values),
        });
        router.push("/recruiter/dashboard");
        router.refresh();
      } else {
        const saved = await api<Company>("/companies/me", {
          method: "PATCH",
          headers,
          body: JSON.stringify(values),
        });
        reset(saved);
        toast.success("Company saved");
      }
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not save company");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor="name">Company name</FieldLabel>
        <Input id="name" placeholder="e.g. PayOrbit" {...register("name")} />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="website">Website</FieldLabel>
        <Input
          id="website"
          placeholder="https://example.com"
          {...register("website", { setValueAs: (v) => (v === "" ? null : v) })}
        />
      </Field>

      <Controller
        control={control}
        name="size"
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="size">Company size</FieldLabel>
            <Select
              value={field.value ?? NONE}
              onValueChange={(v) => field.onChange(v === NONE ? null : v)}
            >
              <SelectTrigger id="size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Prefer not to say</SelectItem>
                {COMPANY_SIZES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s} people
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <Field>
        <FieldLabel htmlFor="about">About</FieldLabel>
        <Textarea
          id="about"
          rows={4}
          placeholder="What does your company do? Candidates see this on your job posts."
          {...register("about", { setValueAs: (v) => (v === "" ? null : v) })}
        />
      </Field>

      <Button type="submit" disabled={saving || (mode === "edit" && !isDirty)}>
        {saving
          ? "Saving…"
          : mode === "create"
            ? "Create company"
            : "Save changes"}
      </Button>
    </form>
  );
}
