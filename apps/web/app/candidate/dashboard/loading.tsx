import { PageHeader } from "@/components/layout/page-header";
import { SkeletonCard } from "@/components/ui-patterns/skeletons";

// Mirrors the loaded layout (2-col grid) so the swap causes no layout shift.
export default function DashboardLoading() {
  return (
    <>
      <PageHeader title="Dashboard" description="Loading…" />
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonCard />
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </>
  );
}
