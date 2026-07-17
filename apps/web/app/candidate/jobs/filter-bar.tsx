"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { JOB_TYPE_LABELS, JOB_TYPES } from "@/lib/jobs";

const ALL = "__all__";

// Filters live in the URL — shareable, back-button friendly, server refetches.
export function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("offset"); // filter change resets pagination
    router.push(`/candidate/jobs?${next.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="f-location">Location</Label>
        <Input
          id="f-location"
          className="w-44"
          placeholder="e.g. Bengaluru"
          defaultValue={params.get("location") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              setParam("location", e.currentTarget.value.trim() || null);
          }}
          onBlur={(e) =>
            setParam("location", e.currentTarget.value.trim() || null)
          }
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="f-type">Job type</Label>
        <Select
          value={params.get("job_type") ?? ALL}
          onValueChange={(v) => setParam("job_type", v === ALL ? null : v)}
        >
          <SelectTrigger id="f-type" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {JOB_TYPES.map((jt) => (
              <SelectItem key={jt} value={jt}>
                {JOB_TYPE_LABELS[jt]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 pb-2">
        <Switch
          id="f-remote"
          checked={params.get("remote") === "true"}
          onCheckedChange={(on) => setParam("remote", on ? "true" : null)}
        />
        <Label htmlFor="f-remote">Remote only</Label>
      </div>
    </div>
  );
}
