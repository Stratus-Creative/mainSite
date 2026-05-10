import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FadeIn, ScrollReveal, Stagger, AccentSweep, ScrollType } from "@/components/motion";

export const metadata: Metadata = {
  title: "Tools — Stratus Creative",
  description:
    "Free, no-signup tools from Stratus Creative. Cost estimators, calculators, and resources to help you scope your project before you spend a dollar.",
  alternates: { canonical: "https://stratus-creative.com/tools" },
};

interface Tool {
  href: string | null;
  name: string;
  blurb: string;
  status: "live" | "soon" | "planned";
  cta: string;
}

const TOOLS: Tool[] = [
  {
    href: "/tools/cost-estimator",
    name: "AI Workflow Cost Estimator",
    blurb:
      "Pick a workflow, set the volume, see the real monthly cost — LLM API, third-party APIs, vector storage, and recommended Care tier. Live calculation, no signup.",
    status: "live",
    cta: "Open the estimator →",
  },
  {
    href: "/tools/website-roi",
    name: "Website ROI calculator",
    blurb:
      "Plug in your average ticket, monthly visitors, and conversion rate. See expected revenue lift, payback period on a Starter site, and 3-year value.",
    status: "live",
    cta: "Run the numbers →",
  },
  {
    href: "/tools/workflow-roi",
    name: "Workflow ROI calculator",
    blurb:
      "Hours per week on a manual process, hourly cost, build budget — out comes monthly net savings, payback months, and 3-year ROI. Conservative / realistic / aggressive presets included.",
    status: "live",
    cta: "Calculate payback →",
  },
  {
    href: "/tools/brand-brief",
    name: "Brand brief generator",
    blurb:
      "Describe your business in two sentences. AI drafts a structured discovery brief — overview, audience, voice, success criteria. Edit, copy as Markdown, or send it with your inquiry.",
    status: "live",
    cta: "Generate a brief →",
  },
  {
    href: "/tools/seo-audit",
    name: "Local SEO audit",
    blurb:
      "Drop in your business name, city, and website. We read your homepage HTML and run heuristic rules — local signals, page basics, structure, technical, opportunities. Honest, not a fake ranking check.",
    status: "live",
    cta: "Audit your site →",
  },
];

export default function ToolsPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <Stagger step={120}>
              <FadeIn variant="slide-left">
                <p className="section-label">Tools</p>
              </FadeIn>
              <FadeIn>
                <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-7xl lg:text-[6.5rem]">
                  Free tools.{" "}
                  <span className="text-accent">
                    <AccentSweep>No signup.</AccentSweep>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn>
                <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
                  Most agencies hide their math. We publish ours. Use these to
                  scope your project, run the numbers, or just qualify yourself
                  before reaching out — with or without us.
                </p>
              </FadeIn>
            </Stagger>
          </div>
        </section>

        {/* Tools grid */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="grid gap-px bg-border/60 lg:grid-cols-2">
              <Stagger step={70}>
              {TOOLS.map((tool) => {
                const wrapper = tool.href ? "a" : "div";
                const interactive = !!tool.href;
                const className = `group flex h-full flex-col bg-background p-8 transition-colors lg:p-10 ${
                  interactive ? "hover:bg-card" : ""
                }`;
                const inner = (
                  <>
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${
                          tool.status === "live"
                            ? "border-accent/40 bg-accent/10 text-accent"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {tool.status === "live"
                          ? "Live · Free"
                          : tool.status === "soon"
                          ? "Coming soon"
                          : "Planned"}
                      </span>
                    </div>

                    <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                      {tool.name}
                    </h2>
                    <p className="mt-4 flex-1 text-sm text-muted-foreground">
                      {tool.blurb}
                    </p>

                    <span
                      className={`mt-8 inline-flex items-center gap-2 text-sm ${
                        interactive
                          ? "text-foreground transition-colors group-hover:text-accent"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span className={interactive ? "underline-hover" : ""}>
                        {tool.cta}
                      </span>
                      {interactive && <span aria-hidden="true">→</span>}
                    </span>
                  </>
                );
                return wrapper === "a" ? (
                  <FadeIn key={tool.name} className="h-full">
                    <Link href={tool.href!} className={`h-full ${className}`}>
                      {inner}
                    </Link>
                  </FadeIn>
                ) : (
                  <FadeIn key={tool.name} className="h-full">
                    <div className={`h-full ${className}`}>{inner}</div>
                  </FadeIn>
                );
              })}
              </Stagger>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <ScrollReveal className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="section-label">Need something else?</p>
                <h2>
                  <ScrollType text="Ask us to build a tool you'd actually use." className="display-heading mt-6 text-3xl sm:text-4xl" />
                </h2>
              </div>
              <div className="lg:col-span-4 lg:justify-self-end">
                <Link
                  href="/start"
                  className="inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-base font-medium text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background"
                >
                  Start a project
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
