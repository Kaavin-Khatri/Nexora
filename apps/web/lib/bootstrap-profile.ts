import { api } from "@/lib/api-client";

// Ensures a profiles row exists after signup / first login.
// Tolerant by design: auth must never fail because bootstrap did —
// the API also bootstraps on first authenticated request as a safety net.
export async function bootstrapProfile(accessToken: string): Promise<void> {
  try {
    await api("/profiles/bootstrap", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (e) {
    console.error("profile bootstrap failed (non-fatal)", e);
  }
}
