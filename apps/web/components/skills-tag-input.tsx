"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { getAccessToken } from "@/lib/jobs";

// Tag input with taxonomy autocomplete (GET /skills?q=). New tags are
// accepted as typed — the API normalizes + inserts them flagged.
export function SkillsTagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onDraftChange(text: string) {
    setDraft(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = text.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const token = await getAccessToken();
        const names = await api<string[]>(
          `/skills?q=${encodeURIComponent(q)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setSuggestions(
          names.filter(
            (n) => !value.some((v) => v.toLowerCase() === n.toLowerCase()),
          ),
        );
      } catch {
        setSuggestions([]);
      }
    }, 250);
  }

  function add(skill: string) {
    const s = skill.trim();
    if (!s) return;
    if (!value.some((v) => v.toLowerCase() === s.toLowerCase())) {
      onChange([...value, s]);
    }
    setDraft("");
    setSuggestions([]);
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((s) => (
            <Badge key={s} variant="secondary" className="gap-1 pr-1">
              {s}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== s))}
                aria-label={`Remove ${s}`}
                className="rounded-full p-0.5 hover:bg-foreground/10"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(draft);
              }
            }}
            placeholder="Type a skill, pick a suggestion or press Enter"
            className="max-w-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => add(draft)}
            aria-label="Add skill"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full max-w-xs overflow-hidden rounded-md border border-border bg-popover shadow-md">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => add(s)}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
