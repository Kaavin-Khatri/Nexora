// The ONLY way web talks to api. Base URL from NEXT_PUBLIC_API_URL.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      // FastAPI errors use `detail`
      message = body.detail ?? body.message ?? message;
    } catch {
      // non-JSON error body: keep statusText
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}
