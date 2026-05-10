import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/structured-data";
import { INDUSTRY_PAGES } from "@/lib/landing-data";
import { FadeIn, ScrollReveal, Stagger, AccentSweep, ScrollType } from "@/components/motion";

interface Params {
  params: Promise<{ industry: string }>;
}

export async function generateStaticParams() {
  return Object.keys(INDUSTRY_PAGES).map((industry) => ({ industry }));
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { industry } = await params;
  const i = INDUSTRY_PAGES[industry];
  if (!i) return { title: "Not found" };
  const title = `Websites for ${i.industry} — Stratus Creative`;
  const description = i.hero.intro;
  return {
    title,
    description,
    alternates: {
      canonical: `https://stratus-creative.com/for/${i.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://stratus-creative.com/for/${i.slug}`,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function IndustryPage({ params }: Params) {
  const { industry } = await params;
  const i = INDUSTRY_PAGES[industry];
  if (!i) notFound();

  return (
    <>
      <FaqJsonLd items={i.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: i.industry, url: `/for/${i.slug}` },
        ]}
      />
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <Stagger step={120}>
              <FadeIn variant="slide-left">
                <p className="section-label">{i.hero.eyebrow}</p>
              </FadeIn>
              <FadeIn>
                <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-7xl lg:text-[6rem]">
                  {i.hero.title}{" "}
                  <span className="text-accent">
                    <AccentSweep>{i.hero.accent}</AccentSweep>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn>
                <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
                  {i.hero.intro}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/start"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Start a project
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-foreground"
              >
                See pricing
              </Link>
                </div>
              </FadeIn>
            </Stagger>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <ScrollReveal>
              <p className="section-label">What you get</p>
              <h2>
                <ScrollType text={`Built for ${i.industry.toLowerCase()}.`} className="display-heading mt-6 text-3xl sm:text-4xl" />
              </h2>
            </ScrollReveal>
            <ul className="mt-12 grid gap-px bg-border/60 sm:grid-cols-2">
              <Stagger step={70}>
              {i.features.map((feat) => (
                <ScrollReveal
                  as="li"
                  key={feat}
                  className="flex items-start gap-4 bg-background p-6 text-base"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span>{feat}</span>
                </ScrollReveal>
              ))}
              </Stagger>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <ScrollReveal className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Common questions</p>
              </div>
              <div className="lg:col-span-8">
                <ul className="divide-y divide-border/60 border-y border-border/60">
                  {i.faqs.map((item) => (
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
            </ScrollReveal>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <ScrollReveal className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="section-label">Next</p>
                <h2>
                  <ScrollType text="Ready to be the next one?" className="display-heading mt-8 text-4xl sm:text-5xl" />
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
                  See our work
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
