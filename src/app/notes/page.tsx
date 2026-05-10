import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getAllNotes } from "@/lib/notes";
import { FadeIn, ScrollReveal, Stagger, AccentSweep } from "@/components/motion";

// 10 minutes — short enough that newly-due articles surface promptly,
// long enough that we're not regenerating on every visit.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Decoded — Stratus Creative",
  description:
    "Plain-language writing on AI, workflows, and web — for people who want to understand how it works without learning to build it.",
  alternates: { canonical: "https://stratus-creative.com/notes" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function NotesIndex() {
  const notes = await getAllNotes();

  return (
    <>
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
                <p className="section-label">Decoded</p>
              </FadeIn>
              <FadeIn>
                <h1 className="display-heading mt-8 max-w-4xl text-5xl sm:text-7xl lg:text-[6.5rem]">
                  The machine,{" "}
                  <span className="text-accent">
                    <AccentSweep>explained.</AccentSweep>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn>
                <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
                  Plain-language writing on AI, workflows, and web — for people
                  who want to understand how it works without learning to build it.
                </p>
                <div className="mt-10">
                  <NewsletterSignup variant="inline" />
                </div>
              </FadeIn>
            </Stagger>
          </div>
        </section>

        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <ul className="divide-y divide-border/60 border-y border-border/60">
              <Stagger step={70}>
              {notes.map((note) => (
                <ScrollReveal as="li" key={note.slug}>
                  <Link
                    href={`/notes/${note.slug}`}
                    className="group grid gap-4 py-8 lg:grid-cols-12 lg:items-baseline lg:gap-8"
                  >
                    <div className="lg:col-span-3">
                      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                        {formatDate(note.published_at!)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="lg:col-span-9">
                      <h2 className="text-2xl font-semibold tracking-tight transition-colors group-hover:text-accent sm:text-3xl">
                        {note.title}
                      </h2>
                      <p className="mt-3 text-base text-muted-foreground">
                        {note.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm text-foreground">
                        <span className="underline-hover">Read</span>
                        <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
              </Stagger>
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
