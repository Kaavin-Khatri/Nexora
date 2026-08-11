import { toast } from "sonner";

// The ONLY way web talks to api. Base URL from NEXT_PUBLIC_API_URL.
const _RAW_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const BASE_URL = _RAW_URL.replace(/\/+$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly request_id?: string;

  constructor(status: number, message: string, request_id?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.request_id = request_id;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    let message = res.statusText;
    let request_id: string | undefined;
    
    request_id = res.headers.get("x-request-id") || undefined;
    
    try {
      const body = await res.json();
      if (body.error) {
        message = body.error.message || message;
        request_id = body.error.request_id || request_id;
      } else {
        // FastAPI default errors use `detail`
        message = body.detail ?? body.message ?? message;
      }
    } catch {
      // non-JSON error body: keep statusText
    }
    
    const apiError = new ApiError(res.status, message, request_id);
    
    // Global toast for failed mutations (anything not GET)
    const method = init?.method?.toUpperCase() || "GET";
    if (method !== "GET" && typeof window !== "undefined") {
      toast.error(message, {
        description: request_id ? `Request ID: ${request_id}` : undefined,
      });
    }
    
    throw apiError;
  }
  return res.json() as Promise<T>;
}
