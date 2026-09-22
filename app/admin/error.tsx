"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-red-400">Error</p>
      <h1 className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
        Something Went Wrong
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted">An unexpected error occurred. Please try again.</p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset} size="lg">
          Try Again
        </Button>
        <Button href="/admin" variant="outline" size="lg">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
