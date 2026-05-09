import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/structured-data";
import { COMPARISONS } from "@/lib/comparison-data";

interface Params {
  params: Promise<{ competitor: string }>;
}

export async function generateStaticParams() {
  return Object.keys(COMPARISONS).map((slug) => ({ competitor: slug }));
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { competitor } = await params;
  const c = COMPARISONS[competitor];
  if (!c) return { title: "Not found" };
  const title = `Stratus Creative vs ${c.competitor} — honest comparison`;
  const description = `An honest comparison of Stratus Creative and ${c.competitor}. When each one is the right call, what each actually costs, and how to decide.`;
  return {
    title,
    description,
    alternates: {
      canonical: `https://stratus-creative.com/vs/${c.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://stratus-creative.com/vs/${c.slug}`,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function VsPage({ params }: Params) {
  const { competitor } = await params;
  const c = COMPARISONS[competitor];
  if (!c) notFound();

  const faqItems = [
    {
      q: `When should I choose Stratus Creative over ${c.competitor}?`,
      a: c.whenStratus.join(" "),
    },
    {
      q: `When should I choose ${c.competitor} over Stratus Creative?`,
      a: c.whenCompetitor.join(" "),
    },
  ];

  const tableSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Stratus Creative vs ${c.competitor} — feature comparison`,
    description: `Side-by-side feature comparison of Stratus Creative and ${c.competitor}.`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: c.rows.length,
    itemListElement: c.rows.map((row, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Thing",
        name: row.feature,
        description: `${c.competitor}: ${row.competitor}. Stratus Creative: ${row.stratus}.`,
      },
    })),
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: `Stratus vs ${c.competitor}`, url: `/vs/${c.slug}` },
        ]}
      />
      <FaqJsonLd items={faqItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tableSchema) }}
      />
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
            <p className="section-label">Comparison · Honest</p>
            <h1 className="display-heading mt-8 max-w-5xl text-4xl sm:text-6xl lg:text-7xl">
              Stratus Creative vs{" "}
              <span className="text-accent">{c.competitor}.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base text-muted-foreground">
              {c.competitorTagline}.
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
            <p className="text-lg leading-relaxed text-foreground sm:text-xl">
              {c.intro}
            </p>
          </div>
        </section>

        {/* When each is right */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="grid gap-px bg-border/60 lg:grid-cols-2">
              <article className="bg-background p-8 lg:p-10">
                <p className="section-label">When {c.competitor} is right</p>
                <ul className="mt-8 space-y-4">
                  {c.whenCompetitor.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 border-b border-border/40 pb-3 text-base text-muted-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2.5 size-1.5 shrink-0 rounded-full bg-muted-foreground"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="bg-background p-8 lg:p-10">
                <p className="section-label">When Stratus is right</p>
                <ul className="mt-8 space-y-4">
                  {c.whenStratus.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 border-b border-border/40 pb-3 text-base"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="section-label">Side by side</p>
            <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
              The full comparison.
            </h2>
            <div className="mt-12 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-4 pr-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      Feature
                    </th>
                    <th className="py-4 pr-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {c.competitor}
                    </th>
                    <th className="py-4 font-mono text-xs uppercase tracking-widest text-accent">
                      Stratus
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {c.rows.map((row) => (
                    <tr key={row.feature} className="border-b border-border/40">
                      <td className="py-4 pr-4 font-medium">{row.feature}</td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        {row.competitor}
                      </td>
                      <td className="py-4 text-foreground">{row.stratus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing math */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-20 lg:py-24">
            <p className="section-label">Pricing math</p>
            <p className="mt-6 text-lg leading-relaxed text-foreground sm:text-xl">
              {c.pricingNote}
            </p>
            <p className="mt-8 text-base text-muted-foreground">
              Want a Loom audit of your current site instead?{" "}
              <Link
                href="/resources/free-website-audit"
                className="underline-hover text-foreground"
              >
                It&apos;s free.
              </Link>
            </p>
          </div>
        </section>

        {/* Closing */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-20 lg:py-24">
            <p className="section-label">Bottom line</p>
            <p className="mt-6 text-2xl leading-snug tracking-tight sm:text-3xl">
              {c.closingThought}
            </p>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="section-label">Next</p>
                <h2 className="display-heading mt-8 text-4xl sm:text-5xl">
                  Want to talk it through?
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
                  href="/pricing"
                  className="inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-base font-medium text-foreground transition-all hover:border-foreground"
                >
                  See our pricing
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
