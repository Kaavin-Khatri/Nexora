import { createBrowserClient } from "@supabase/ssr";

// Browser client. Cookie-based storage via @supabase/ssr so the session is
// visible to server components and middleware (needed in 3.3).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
