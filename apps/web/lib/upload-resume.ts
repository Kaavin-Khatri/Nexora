import { createClient } from "@/lib/supabase/client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Mirrors app/schemas/resume_parsed.py (blank-first: every field nullable).
export type ParsedResume = {
  contact: {
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
  };
  summary: string | null;
  skills: string[];
  experience: {
    title: string | null;
    company: string | null;
    start: string | null;
    end: string | null;
    current: boolean | null;
    bullets: string[];
  }[];
  education: {
    degree: string | null;
    institution: string | null;
    year: string | null;
  }[];
  certifications: string[];
  total_years_estimate: number | null;
};

export type ResumeStatus = {
  id: string;
  status: "uploaded" | "parsing" | "parsed" | "failed";
  error_message?: string | null;
  skills?: string[] | null;
  parsed_json?: ParsedResume | null;
};

// XHR (not fetch) because only XHR exposes real upload progress. This is the
// one authed call that legitimately bypasses api-client — multipart + progress.
export function uploadResume(
  file: File,
  token: string,
  onProgress: (pct: number) => void,
): Promise<ResumeStatus> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/resumes`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        let msg = "Upload failed";
        try {
          msg = JSON.parse(xhr.responseText).detail ?? msg;
        } catch {
          // keep default
        }
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

async function authed(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<ResumeStatus> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export function getResumeStatus(id: string, token: string) {
  return authed(`/resumes/${id}`, token);
}

export function reparseResume(id: string, token: string) {
  return authed(`/resumes/${id}/reparse`, token, { method: "POST" });
}

export function updateSkills(id: string, skills: string[], token: string) {
  return authed(`/resumes/${id}/skills`, token, {
    method: "PATCH",
    body: JSON.stringify({ skills }),
  });
}

export async function getAccessToken(): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? "";
}
