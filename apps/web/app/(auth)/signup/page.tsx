"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { bootstrapProfile } from "@/lib/bootstrap-profile";

type Role = "candidate" | "recruiter";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Default to candidate, but read from URL if ?role=recruiter is passed
  const initialRole = (searchParams.get("role") as Role) || "candidate";
  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      await bootstrapProfile(data.session.access_token);
    }
    router.push(`/${role}/dashboard`);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border p-6"
      >
        <h1 className="text-xl font-semibold">Create your Nexora account</h1>

        <div className="grid grid-cols-2 gap-2">
          {(["candidate", "recruiter"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              aria-pressed={role === r}
              className={`rounded-md border px-3 py-2 text-sm capitalize ${
                role === r
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : ""
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading ? "Signing up…" : `Sign up as ${role}`}
        </button>

        <p className="text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center p-4">Loading...</main>}>
      <SignupForm />
    </Suspense>
  );
}
