import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/structured-data";
import { PILLAR_PAGES } from "@/lib/landing-data";

interface Params {
  params: Promise<{ pillar: string }>;
}

export async function generateStaticParams() {
  return Object.keys(PILLAR_PAGES).map((pillar) => ({ pillar }));
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { pillar } = await params;
  const p = PILLAR_PAGES[pillar];
  if (!p) return { title: "Not found" };
  const title = `${p.pillar} — Stratus Creative`;
  const description = p.hero.intro;
  return {
    title,
    description,
    alternates: {
      canonical: `https://stratus-creative.com/services/${p.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://stratus-creative.com/services/${p.slug}`,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PillarPage({ params }: Params) {
  const { pillar } = await params;
  const p = PILLAR_PAGES[pillar];
  if (!p) notFound();

  return (
    <>
      <FaqJsonLd items={p.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: p.pillar, url: `/services/${p.slug}` },
        ]}
      />
      <SiteHeader activePath="/services" />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <p className="section-label">{p.hero.eyebrow}</p>
            <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-7xl lg:text-[6.5rem]">
              {p.hero.title}{" "}
              <span className="text-accent">{p.hero.accent}</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
              {p.hero.intro}
            </p>
          </div>
        </section>

        {/* Problem */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">{p.problem.label}</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="display-heading text-3xl sm:text-4xl">
                  {p.problem.title}
                </h2>
                <p className="mt-6 text-base text-muted-foreground sm:text-lg">
                  {p.problem.body}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="section-label">What we build</p>
            <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
              What does Stratus build for {p.pillar.toLowerCase()}?
            </h2>
            <ul className="mt-12 grid gap-px bg-border/60 sm:grid-cols-2">
              {p.capabilities.map((cap) => (
                <li
                  key={cap}
                  className="flex items-start gap-4 bg-background p-6 text-base"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="section-label">Pricing</p>
            <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
              How much does {p.pillar.toLowerCase()} work cost?
            </h2>
            <div className="mt-12 grid gap-px bg-border/60 lg:grid-cols-3">
              {p.pricing.ranges.map((r) => (
                <article
                  key={r.name}
                  className="flex flex-col bg-background p-8 lg:p-10"
                >
                  <p className="section-label">{r.name}</p>
                  <p className="mt-6 text-4xl font-semibold tracking-tight">
                    {r.price}
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {r.detail}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-sm text-foreground"
              >
                <span className="underline-hover">Full pricing</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/tools/cost-estimator"
                className="inline-flex items-center gap-2 text-sm text-foreground"
              >
                <span className="underline-hover">Run the cost estimator</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="section-label">Process</p>
            <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
              How does Stratus deliver {p.pillar.toLowerCase()} projects?
            </h2>
            <div className="mt-12 grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
              {p.process.map((step) => (
                <article
                  key={step.step}
                  className="flex flex-col gap-4 bg-background p-8"
                >
                  <span className="font-mono text-xs tracking-widest text-accent">
                    {step.step}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Common questions</p>
              </div>
              <div className="lg:col-span-8">
                <ul className="divide-y divide-border/60 border-y border-border/60">
                  {p.faqs.map((item) => (
                    <li key={item.q} className="py-6 lg:py-8">
                      <p className="text-lg font-medium tracking-tight">
                        {item.q}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.a}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
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
                  Tell us what you&apos;re building.
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
                  href="/services"
                  className="inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-base font-medium text-foreground transition-all hover:border-foreground"
                >
                  All services
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
