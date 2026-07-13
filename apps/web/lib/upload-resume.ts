import { createClient } from "@/lib/supabase/client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ResumeStatus = {
  id: string;
  status: "uploaded" | "parsing" | "parsed" | "failed";
  error_message?: string | null;
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

export async function getResumeStatus(
  id: string,
  token: string,
): Promise<ResumeStatus> {
  const res = await fetch(`${BASE_URL}/resumes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Could not fetch resume status");
  return res.json();
}

export async function getAccessToken(): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? "";
}
