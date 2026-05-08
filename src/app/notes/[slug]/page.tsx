import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NOTES, getNote } from "@/lib/notes-data";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/structured-data";
import { NewsletterSignup } from "@/components/newsletter-signup";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return NOTES.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return { title: "Not found" };
  return {
    title: `${note.title} — Stratus Creative`,
    description: note.description,
    alternates: { canonical: `https://stratus-creative.com/notes/${slug}` },
    openGraph: {
      title: note.title,
      description: note.description,
      type: "article",
      publishedTime: note.date,
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

// Minimal markdown renderer — supports paragraphs, **bold**, [text](url)
function renderBody(body: string) {
  const paragraphs = body.split(/\n\n+/);
  return paragraphs.map((para, i) => {
    const html = para
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="underline-hover text-foreground">$1</a>'
      );

    if (para.startsWith("- ")) {
      const items = para
        .split("\n")
        .filter((line) => line.startsWith("- "))
        .map((line) =>
          line
            .slice(2)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            .replace(
              /\[([^\]]+)\]\(([^)]+)\)/g,
              '<a href="$2" class="underline-hover text-foreground">$1</a>'
            )
        );
      return (
        <ul
          key={i}
          className="my-6 space-y-2 text-base text-muted-foreground"
        >
          {items.map((item, j) => (
            <li key={j} className="flex gap-3">
              <span aria-hidden="true" className="text-accent">
                •
              </span>
              <span dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p
        key={i}
        className="my-6 text-base leading-relaxed text-muted-foreground sm:text-lg"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
}

export default async function NotePage({ params }: Params) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  return (
    <>
      <ArticleJsonLd
        title={note.title}
        description={note.description}
        date={note.date}
        slug={note.slug}
        tags={note.tags}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Notes", url: "/notes" },
          { name: note.title, url: `/notes/${note.slug}` },
        ]}
      />
      <SiteHeader />

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-20 lg:py-24">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">←</span> Back to notes
          </Link>

          <div className="mt-10">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {formatDate(note.date)}
            </p>
            <h1 className="display-heading mt-6 text-4xl sm:text-5xl lg:text-6xl">
              {note.title}
            </h1>
            <div className="mt-6 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-12 border-t border-border/60 pt-12">
            {renderBody(note.body)}
          </div>

          <div className="mt-16 border-t border-border/60 pt-12">
            <NewsletterSignup />
          </div>

          <div className="mt-16 flex flex-col gap-3 border-t border-border/60 pt-8 sm:flex-row sm:justify-between">
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span aria-hidden="true">←</span> All notes
            </Link>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 text-sm text-foreground"
            >
              <span className="underline-hover">Start a project</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
