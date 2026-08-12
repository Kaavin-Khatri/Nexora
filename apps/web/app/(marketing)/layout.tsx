import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FloatingNav } from "@/components/aceternity/floating-nav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: "Product", link: "#" },
    { name: "Pricing", link: "#" },
    { name: "Contact", link: "#" },
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <FloatingNav 
        navItems={navItems} 
        actionButton={
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-white transition-colors text-neutral-300">
              Log In
            </Link>
            <Button asChild size="sm" className="rounded-full shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        }
      />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/5 py-8 mt-24">
        <div className="container mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 md:flex-row px-4 sm:px-8">
          <p className="text-center text-sm leading-loose text-neutral-500 md:text-left">
            Built for precision. Nexora is the AI-native hiring platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
