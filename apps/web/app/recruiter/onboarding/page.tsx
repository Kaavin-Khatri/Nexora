import { redirect } from "next/navigation";
import { CompanyFormCard } from "@/components/company-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/server";

// One-time forced flow. Lives outside the (shell) group: no sidebar, no loop.
export default async function RecruiterOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const company = await api("/companies/me", {
    headers: { Authorization: `Bearer ${session?.access_token}` },
    cache: "no-store",
  }).catch(() => null);

  // Already onboarded → never show this page again.
  if (company) redirect("/recruiter/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Set up your company</CardTitle>
          <CardDescription>
            One quick step before you can post jobs — candidates see these
            details on every posting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyFormCard mode="create" />
        </CardContent>
      </Card>
    </main>
  );
}
