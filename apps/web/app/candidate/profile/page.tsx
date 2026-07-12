import { PageHeader } from "@/components/layout/page-header";
import { api } from "@/lib/api-client";
import type { ProfileForm } from "@/lib/candidate-schema";
import { createClient } from "@/lib/supabase/server";
import { ProfileFormCard } from "./profile-form";

export default async function CandidateProfilePage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const profile = await api<ProfileForm>("/candidates/me", {
    headers: { Authorization: `Bearer ${session?.access_token}` },
    cache: "no-store",
  });

  return (
    <>
      <PageHeader
        title="Profile"
        description="These details power your job matches — keep them current."
      />
      <ProfileFormCard initial={profile} />
    </>
  );
}
