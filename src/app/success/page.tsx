import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Payment confirmed</h1>
        <p className="mt-4 text-muted-foreground">
          Thank you for choosing Stratus Creative. We&apos;ll be in touch within
          one business day to get started on your website.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Questions? Email us at{" "}
          <a
            href="mailto:business@stratus-creative.com"
            className="underline underline-offset-4 hover:text-foreground"
          >
            business@stratus-creative.com
          </a>
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
