// Minimal landing — replaced by the real marketing page in a later phase.
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold">Nexora</h1>
      <p className="max-w-md text-muted-foreground">
        AI-powered job matching — upload a resume, get transparent match scores,
        apply with confidence.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/signup">Get started</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    </main>
  );
}
