import { api } from "@/lib/api-client";

// Feature flag: POST /profiles/bootstrap lands in Step 3.2.
// Flip to true in 3.2, then remove the flag entirely.
const BOOTSTRAP_ENABLED = false;

// Ensures a profiles row exists after signup / first login.
// Tolerant by design: auth must never fail because bootstrap did.
export async function bootstrapProfile(accessToken: string): Promise<void> {
  if (!BOOTSTRAP_ENABLED) return;
  try {
    await api("/profiles/bootstrap", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (e) {
    console.error("profile bootstrap failed (non-fatal)", e);
  }
}
