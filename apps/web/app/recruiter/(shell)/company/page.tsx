import { PageHeader } from "@/components/layout/page-header";
import { CompanyFormCard } from "@/components/company-form";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import type { Company } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";

export default async function RecruiterCompanyPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Layout already guarantees a company exists.
  const company = await api<Company>("/companies/me", {
    headers: { Authorization: `Bearer ${session?.access_token}` },
    cache: "no-store",
  });

  return (
    <>
      <PageHeader
        title="Company"
        description="These details appear on every job you post."
      />
      <Card className="max-w-xl">
        <CardContent>
          <CompanyFormCard mode="edit" initial={company} />
        </CardContent>
      </Card>
    </>
  );
}
