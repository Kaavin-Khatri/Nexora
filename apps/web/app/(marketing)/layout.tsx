import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold tracking-tight">Nexora</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline">
              Log In
            </Link>
            <Button asChild size="sm">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 sm:px-8">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for precision. Nexora is the AI-native hiring platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
