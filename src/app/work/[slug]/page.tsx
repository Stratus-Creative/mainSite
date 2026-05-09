import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BreadcrumbJsonLd } from "@/components/structured-data";
import { CASE_STUDIES, getCaseStudy } from "@/lib/case-studies-data";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) return { title: "Not found" };
  const title = `${c.hero.title} ${c.hero.accent} — Stratus Creative`;
  const description = c.shortDescription;
  return {
    title,
    description,
    alternates: {
      canonical: `https://stratus-creative.com/work/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://stratus-creative.com/work/${slug}`,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Work", url: "/work" },
          { name: `${c.hero.title} ${c.hero.accent}`, url: `/work/${c.slug}` },
        ]}
      />
      <SiteHeader activePath="/work" />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
            <p className="section-label">{c.hero.eyebrow}</p>
            <h1 className="display-heading mt-8 max-w-5xl text-4xl sm:text-6xl lg:text-7xl">
              {c.hero.title}{" "}
              <span className="text-accent">{c.hero.accent}</span>
            </h1>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <span>{c.client}</span>
              <span>{c.industry}</span>
              <span>{c.pillar}</span>
              <span>{formatDate(c.date)}</span>
            </div>
          </div>
        </section>

        {/* Outcome — surfaced first because it's what matters */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <p className="section-label">Outcome</p>
            <div className="mt-8 grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
              {c.outcome.map((item) => (
                <article
                  key={item.metric}
                  className="bg-background p-6 lg:p-8"
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {item.metric}
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-accent">
                    {item.value}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Problem / Approach */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
            <p className="section-label">Problem</p>
            <p className="mt-6 text-lg leading-relaxed text-foreground sm:text-xl">
              {c.problem}
            </p>
          </div>
        </section>

        <section className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
            <p className="section-label">Approach</p>
            <p className="mt-6 text-lg leading-relaxed text-foreground sm:text-xl">
              {c.approach}
            </p>
          </div>
        </section>

        {/* Details */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
            <p className="section-label">What we built</p>
            <ul className="mt-8 space-y-4">
              {c.details.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-3 border-b border-border/40 pb-4 text-base"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tech stack */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
            <p className="section-label">Tech</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {c.techStack.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border px-4 py-1.5 font-mono text-xs text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="section-label">Next</p>
                <h2 className="display-heading mt-8 text-4xl sm:text-5xl">
                  Want a project like this?
                </h2>
              </div>
              <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
                <Link
                  href="/start"
                  className="inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  Start a project
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/work"
                  className="inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-base font-medium text-foreground transition-all hover:border-foreground"
                >
                  Back to work
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
