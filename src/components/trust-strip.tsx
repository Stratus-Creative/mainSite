interface TrustStripProps {
  variant?: "stack" | "clients";
}

const STACK = [
  { name: "Next.js", role: "Framework" },
  { name: "Vercel", role: "Hosting" },
  { name: "Supabase", role: "Database & auth" },
  { name: "Convex", role: "Realtime backend" },
  { name: "Stripe", role: "Payments" },
  { name: "OpenAI", role: "AI" },
  { name: "Anthropic", role: "AI" },
  { name: "Google Gemini", role: "AI" },
  { name: "Cloudflare", role: "Security" },
  { name: "Sentry", role: "Observability" },
  { name: "Resend", role: "Email" },
];

export function TrustStrip({ variant = "stack" }: TrustStripProps) {
  if (variant === "clients") {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card p-8 text-center lg:p-10">
        <p className="section-label justify-center">Selected clients</p>
        <p className="mt-4 max-w-lg mx-auto text-sm text-muted-foreground">
          Stratus is a young studio. We&apos;d rather have a small list of
          clients we&apos;re proud of than a wall of logos that means nothing.
          Yours could be the first.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
      <p className="section-label">Built with the boring stuff that works</p>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        We use battle-tested infrastructure so your site stays fast, secure,
        and actually loads when customers visit it.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-3 lg:grid-cols-5">
        {STACK.map((tool) => (
          <div
            key={tool.name}
            className="flex flex-col gap-1 bg-card p-4"
          >
            <span className="text-sm font-medium tracking-tight text-foreground">
              {tool.name}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {tool.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
