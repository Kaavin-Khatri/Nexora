import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6 space-y-4">
      <h2 className="text-4xl font-bold tracking-tight">404</h2>
      <h3 className="text-xl font-semibold">Page not found</h3>
      <p className="text-muted-foreground text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild variant="default" className="mt-4">
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
