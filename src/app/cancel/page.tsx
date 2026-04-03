import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Payment cancelled</h1>
        <p className="mt-4 text-muted-foreground">
          No worries — your payment was not processed. Head back whenever
          you&apos;re ready.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Have questions? Reach us at{" "}
          <a
            href="mailto:business@stratus-creative.com"
            className="underline underline-offset-4 hover:text-foreground"
          >
            business@stratus-creative.com
          </a>
        </p>
        <Link
          href="/#pricing"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to pricing
        </Link>
      </div>
    </main>
  );
}
