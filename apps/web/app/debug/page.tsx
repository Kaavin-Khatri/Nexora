// Temporary handshake check — deleted in Phase 4.
import { api } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const health = await api<{ status: string }>("/health");
  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>API handshake</h1>
      <pre>{JSON.stringify(health, null, 2)}</pre>
    </main>
  );
}
