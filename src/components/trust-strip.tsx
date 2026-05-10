interface TrustStripProps {
  variant?: "stack" | "clients";
}

const STACK_GROUPS = [
  {
    category: "Framework & Hosting",
    items: [
      { name: "Next.js", role: "Framework" },
      { name: "Tailwind CSS", role: "Styling" },
      { name: "Vercel", role: "Hosting" },
    ],
  },
  {
    category: "Database & Backend",
    items: [
      { name: "Supabase", role: "Database & auth" },
      { name: "Convex", role: "Realtime backend" },
      { name: "Stripe", role: "Payments" },
    ],
  },
  {
    category: "AI",
    items: [
      { name: "Anthropic", role: "Claude" },
      { name: "OpenAI", role: "GPT-4o" },
      { name: "Google Gemini", role: "Gemini" },
    ],
  },
  {
    category: "Infrastructure",
    items: [
      { name: "Cloudflare", role: "Security" },
      { name: "Sentry", role: "Observability" },
      { name: "Resend", role: "Email" },
    ],
  },
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
    <div className="card-hover rounded-2xl border border-border bg-card p-6 lg:p-8">
      <p className="section-label">Built with the boring stuff that works</p>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        We use battle-tested infrastructure so your site stays fast, secure,
        and actually loads when customers visit it.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-px bg-border/60 lg:grid-cols-4">
        {STACK_GROUPS.map((group) => (
          <div key={group.category} className="flex flex-col gap-px bg-border/60">
            <div className="bg-card px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                {group.category}
              </span>
            </div>
            {group.items.map((tool) => (
              <div key={tool.name} className="flex flex-col gap-0.5 bg-card px-4 py-3">
                <span className="text-sm font-medium tracking-tight text-foreground">
                  {tool.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {tool.role}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
