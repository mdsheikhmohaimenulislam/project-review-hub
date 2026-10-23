import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-primary">404</p>

        <h1 className="mt-2 text-3xl font-bold">
          Page not found
        </h1>

        <p className="mt-2 text-muted-foreground">
          The page you are looking for does not exist.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/">Home link</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}