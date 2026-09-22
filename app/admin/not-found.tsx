import Button from "@/components/ui/Button";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-green">404</p>
      <h1 className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted">
        The admin page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button href="/admin" size="lg" className="mt-8">
        Back to Dashboard
      </Button>
    </div>
  );
}
